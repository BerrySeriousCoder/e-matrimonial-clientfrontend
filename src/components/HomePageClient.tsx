"use client";
import React, { useState, useEffect, useRef } from 'react';
import Header from './Header';
import NewspaperCard from './NewspaperCard';
import Pagination from './Pagination';
import PostAdDialog from './PostAdDialog';
import EmailDialog from './EmailDialog';
import AuthDialog from './AuthDialog';
import SearchFilters from './SearchFilters';
import LoginButtonAlert from './LoginButtonAlert';
import ProfileCardAlert from './ProfileCardAlert';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUITexts } from '../hooks/useUITexts';
import { useDebounce } from '../hooks/useDebounce';
import { useFluidResponsive } from '../hooks/useFluidResponsive';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

type Post = {
  id: number;
  email: string;
  content: string;
  createdAt: string;
  lookingFor?: 'bride' | 'groom';
  fontSize?: 'default' | 'medium' | 'large';
  bgColor?: string;
};

type PostsData = {
  posts: Post[];
  totalPages: number;
  currentPage: number;
};

function usePosts(page: number, initialData: PostsData | undefined, lookingFor?: string, search?: string, filters?: number[]) {
  return useQuery({
    queryKey: ['posts', page, lookingFor, search, filters],
    queryFn: async () => {
      const url = new URL(`${API_URL}/posts`);
      url.searchParams.set('page', page.toString());
      if (lookingFor) {
        url.searchParams.set('lookingFor', lookingFor);
      }
      if (search && search.trim()) {
        url.searchParams.set('search', search.trim());
      }
      if (filters && filters.length > 0) {
        url.searchParams.set('filters', JSON.stringify(filters));
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    initialData: page === 1 && lookingFor === 'groom' && (!search || !search.trim()) && (!filters || filters.length === 0) ? initialData : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default function HomePageClient({ initialData }: { initialData: PostsData }) {
  const { texts } = useUITexts();
  const [filter, setFilter] = useState<'selected' | 'bride' | 'groom'>(() => {
    // Coerce any legacy persisted 'all' value to 'groom'
    return 'groom';
  });
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const debouncedSearch = useDebounce(search, 500); // 500ms delay
  
  // Initialize page from URL params or localStorage, fallback to 1
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      // First try to get from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      console.log('Page initialization - URL params:', window.location.search, 'pageParam:', pageParam);
      if (pageParam) {
        const pageNum = parseInt(pageParam, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          console.log('Using page from URL:', pageNum);
          return pageNum;
        }
      }
      
      // Fallback to localStorage
      const savedPage = localStorage.getItem('currentPage');
      console.log('Page initialization - localStorage:', savedPage);
      if (savedPage) {
        const pageNum = parseInt(savedPage, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          console.log('Using page from localStorage:', pageNum);
          return pageNum;
        }
      }
    }
    console.log('Using default page: 1');
    return 1;
  });
  
  const [selected, setSelected] = useState<Post[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('selectedAds');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectError, setSelectError] = useState('');
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState<{ open: boolean; postId?: number; toEmail?: string }>({ open: false });
  const [lastEmailMsg, setLastEmailMsg] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lastEmailMsg') || '';
    }
    return '';
  });
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [jwt, setJwt] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jwt');
    }
    return null;
  });
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userEmail');
    }
    return null;
  });
  const [userSelected, setUserSelected] = useState<Post[]>([]);
  const queryClient = useQueryClient();
  const [hasMounted, setHasMounted] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const initialLoadProcessed = useRef(false);
  
  useEffect(() => { 
    setHasMounted(true);
    // Mark initial load as complete after a short delay
    setTimeout(() => {
      setIsInitialLoad(false);
      initialLoadProcessed.current = true;
    }, 100);
  }, []);

  // Comic alert states
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [hasSelectedProfile, setHasSelectedProfile] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hasSelectedProfile') === 'true';
    }
    return false;
  });
  const [lastSelectedPostId, setLastSelectedPostId] = useState<number | null>(null);
  
  // Refs for alert targeting
  const loginButtonRef = useRef<HTMLButtonElement>(null);
  const profilesDropdownRef = useRef<HTMLSelectElement>(null);

  // Save page to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && page > 1) {
      localStorage.setItem('currentPage', page.toString());
    } else if (typeof window !== 'undefined' && page === 1) {
      localStorage.removeItem('currentPage');
    }
  }, [page]);

  // Update URL when page changes (but don't trigger navigation)
  useEffect(() => {
    if (typeof window !== 'undefined' && hasMounted) {
      const url = new URL(window.location.href);
      if (page > 1) {
        url.searchParams.set('page', page.toString());
      } else {
        url.searchParams.delete('page');
      }
      
      // Update URL without triggering a page reload
      window.history.replaceState({}, '', url.toString());
    }
  }, [page, hasMounted]);

  useEffect(() => {
    sessionStorage.setItem('selectedAds', JSON.stringify(selected));
  }, [selected]);

  useEffect(() => {
    localStorage.setItem('lastEmailMsg', lastEmailMsg);
  }, [lastEmailMsg]);

  // Sync selected profiles for logged-in user
  useEffect(() => {
    if (jwt) {
      // On login, migrate sessionStorage selections to backend, then fetch from backend
      const migrateAndFetch = async () => {
        const saved = sessionStorage.getItem('selectedAds');
        let selected: Post[] = [];
        try {
          if (saved) {
            const arr: Post[] = JSON.parse(saved);
            if (arr.length) {
              // Send one request per profileId
              await Promise.all(arr.map(p =>
                fetch(`${API_URL}/user/selected-profiles`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
                  body: JSON.stringify({ action: 'add', profileId: p.id }),
                })
              ));
            }
          }
          // Fetch selected profiles from backend
          const res = await fetch(`${API_URL}/user/selected-profiles`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.selected)) {
            selected = data.selected;
            setUserSelected(selected);
            sessionStorage.removeItem('selectedAds');
          }
        } catch {}
      };
      migrateAndFetch();
    } else {
      setUserSelected([]);
    }
  }, [jwt]);

  // Reset page when search, filter, or search filters change (but not on initial load)
  useEffect(() => {
    console.log('Page reset effect triggered - isInitialLoad:', isInitialLoad, 'initialLoadProcessed:', initialLoadProcessed.current, 'debouncedSearch:', debouncedSearch, 'filter:', filter, 'selectedFilters:', selectedFilters);
    if (initialLoadProcessed.current && hasMounted) {
      console.log('Resetting page to 1 due to filter/search change');
      setPage(1);
    }
  }, [debouncedSearch, filter, selectedFilters, hasMounted]);

  const { data, isLoading, isError, refetch } = usePosts(page, initialData, filter === 'selected' ? undefined : filter, debouncedSearch, selectedFilters);
  const posts: Post[] = data?.posts || [];
  const totalPages = data?.totalPages || 1;
  
  // Use posts data as dependency for responsive layout recalculation
  const { columnCount, columnGap, isOverflowing, containerRef } = useFluidResponsive(posts);

  useEffect(() => {
    if (page < totalPages && (!debouncedSearch || !debouncedSearch.trim())) {
      queryClient.prefetchQuery({
        queryKey: ['posts', page + 1, filter === 'selected' ? undefined : filter, debouncedSearch, selectedFilters],
        queryFn: async () => {
          const url = new URL(`${API_URL}/posts`);
          url.searchParams.set('page', (page + 1).toString());
          if (filter !== 'selected') {
            url.searchParams.set('lookingFor', filter);
          }
          if (debouncedSearch && debouncedSearch.trim()) {
            url.searchParams.set('search', debouncedSearch.trim());
          }
          if (selectedFilters && selectedFilters.length > 0) {
            url.searchParams.set('filters', JSON.stringify(selectedFilters));
          }
          const res = await fetch(url.toString());
          if (!res.ok) throw new Error('Failed to fetch posts');
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [page, totalPages, queryClient, filter, debouncedSearch, selectedFilters]);

  // Helper to determine selected state
  const isSelected = (id: number) => {
    if (jwt) return userSelected.some(p => p.id === id);
    return selected.some(p => p.id === id);
  };

  // Handle select/unselect for both guest and logged-in user
  const handleSelect = (post: Post) => {
    const isCurrentlySelected = isSelected(post.id);
    
    if (jwt) {
      // Backend sync
      const already = userSelected.some(p => p.id === post.id);
      if (!already && userSelected.length >= 20) {
        setSelectError('You can only select up to 20 profiles per session.');
        return;
      }
      setSelectError('');
      fetch(`${API_URL}/user/selected-profiles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ action: already ? 'remove' : 'add', profileId: post.id }),
      })
        .then(() => {
          setUserSelected(sel =>
            already ? sel.filter(p => p.id !== post.id) : [...sel, post]
          );
        });
    } else {
      if (!isCurrentlySelected && selected.length >= 20) {
        setSelectError('You can only select up to 20 profiles per session.');
        return;
      }
      setSelectError('');
      setSelected(sel =>
        isCurrentlySelected
          ? sel.filter(p => p.id !== post.id)
          : [...sel, post]
      );

      // Show comic alerts for first-time selection by non-logged-in users
      if (!isCurrentlySelected && !hasSelectedProfile) {
        setLastSelectedPostId(post.id);
        setShowLoginAlert(true);
        setShowProfileAlert(true);
        setHasSelectedProfile(true);
        localStorage.setItem('hasSelectedProfile', 'true');
        
        // Auto-dismiss alerts after 8 seconds
        setTimeout(() => {
          setShowLoginAlert(false);
          setShowProfileAlert(false);
        }, 8000);
      }
    }
  };

  const getEmailForPost = (postId?: number) => {
    const post = posts.find((p: Post) => p.id === postId);
    return post?.email || '';
  };

  // Show all selected posts at once in 'selected' mode
  const selectedPosts = jwt ? userSelected : selected;
  const showPagination = filter === 'bride' || filter === 'groom';
  const showPosts = filter === 'selected' ? selectedPosts : posts;

  return (
    <>
      <Header
        onPostAd={() => setShowPostDialog(true)}
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
        isSearching={search !== debouncedSearch}
        selectedFilters={selectedFilters}
        onFiltersChange={setSelectedFilters}
        page={page}
        profilesDropdownRef={profilesDropdownRef}
        right={
          !hasMounted ? null : (
            jwt ? (
              <div className="flex items-center gap-3">
                <span className="font-serif text-sm text-gray-700 font-medium">
                  {userEmail}
                </span>
                <button
                  className="px-4 py-2 bg-transparent text-black font-medium hover:bg-gray-100/50 transition-colors text-sm"
                  onClick={() => {
                    setJwt(null);
                    setUserEmail(null);
                    localStorage.removeItem('jwt');
                    localStorage.removeItem('userEmail');
                    setUserSelected([]);
                  }}
                >
                  {texts.logout}
                </button>
              </div>
            ) : (
              <button
                ref={loginButtonRef}
                className="px-4 py-2 bg-transparent text-black font-medium hover:bg-gray-100/50 transition-colors text-sm"
                onClick={() => setAuthDialogOpen(true)}
              >
                {texts.login}
              </button>
            )
          )
        }
      />
      {selectError && (
        <div className="text-center text-red-600 mb-4 font-serif font-bold">{selectError}</div>
      )}
      {isOverflowing && (
        <div className="text-center text-orange-600 mb-2 font-serif text-sm bg-orange-50 p-2 rounded">
          Layout adjusting to fit screen width...
        </div>
      )}
      {isLoading ? (
        <div className="text-center py-12 text-lg font-serif">Loading matrimonial advertisements...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-600 font-serif">Failed to load advertisements.</div>
      ) : (
        <div className="container-responsive" ref={containerRef}>
          <div 
            className="gap-0 newspaper-masonry pt-2 px-2 sm:px-4 lg:px-6 text-responsive" 
            style={{ 
              columnCount: columnCount,
              columnFill: 'balance',
              columnGap: `${columnGap}px`,
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden'
            }}
          >
          {showPosts
            .map((post: Post) => (
              <div 
                key={post.id} 
                className="break-inside-avoid mb-3 sm:mb-4"
              >
                <NewspaperCard
                  content={post.content}
                  selected={isSelected(post.id)}
                  onSelect={() => handleSelect(post)}
                  onEmail={() => setShowEmailDialog({ open: true, postId: post.id, toEmail: post.email })}
                  fontSize={post.fontSize}
                  bgColor={post.bgColor}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {showPagination && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
      {showPagination && (
        <div className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 font-serif italic px-2 sm:px-4">
          Page {page} of {totalPages} | Showing matrimonial advertisements
          {filter === 'bride' && ` (${texts.filterBride})`}
          {filter === 'groom' && ` (${texts.filterGroom})`}
        </div>
      )}
      {filter === 'selected' && (
        <div className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6 font-serif italic px-2 sm:px-4">
          Showing {selectedPosts.length} selected profile{selectedPosts.length !== 1 ? 's' : ''}
        </div>
      )}
      <PostAdDialog
        open={showPostDialog}
        onClose={() => setShowPostDialog(false)}
        onSuccess={() => refetch()}
        isAuthenticated={!!jwt}
        userEmail={userEmail || ''}
        jwt={jwt || ''}
      />
      <EmailDialog
        open={showEmailDialog.open}
        onClose={() => setShowEmailDialog({ open: false })}
        toEmail={showEmailDialog.toEmail || ''}
        lastMsg={lastEmailMsg}
        setLastMsg={setLastEmailMsg}
        isAuthenticated={!!jwt}
        userEmail={userEmail || ''}
        jwt={jwt || ''}
        postId={showEmailDialog.postId}
        onOpenAuthDialog={() => setAuthDialogOpen(true)}
      />
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onAuth={(token, email) => {
          setJwt(token);
          setUserEmail(email);
          localStorage.setItem('jwt', token);
          localStorage.setItem('userEmail', email);
          setAuthDialogOpen(false);
        }}
      />
      
      {/* Comic Alerts */}
      <LoginButtonAlert
        show={showLoginAlert}
        onDismiss={() => setShowLoginAlert(false)}
        loginButtonRef={loginButtonRef}
      />
      
      <ProfileCardAlert
        show={showProfileAlert}
        onDismiss={() => setShowProfileAlert(false)}
        profilesDropdownRef={profilesDropdownRef}
      />
    </>
  );
} 