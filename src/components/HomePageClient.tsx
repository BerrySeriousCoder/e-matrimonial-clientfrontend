"use client";
import React, { useState, useEffect } from 'react';
import Header from './Header';
import NewspaperCard from './NewspaperCard';
import Pagination from './Pagination';
import PostAdDialog from './PostAdDialog';
import EmailDialog from './EmailDialog';
import AuthDialog from './AuthDialog';
import SearchFilters from './SearchFilters';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUITexts } from '../hooks/useUITexts';
import { useDebounce } from '../hooks/useDebounce';

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
      if (lookingFor && lookingFor !== 'all' && lookingFor !== 'selected') {
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
    initialData: page === 1 && (lookingFor === 'all' || !lookingFor) && (!search || !search.trim()) && (!filters || filters.length === 0) ? initialData : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default function HomePageClient({ initialData }: { initialData: PostsData }) {
  const { texts } = useUITexts();
  const [filter, setFilter] = useState<'all' | 'selected' | 'bride' | 'groom'>('all');
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<number[]>([]);
  const debouncedSearch = useDebounce(search, 500); // 500ms delay
  
  // Initialize page from URL params or localStorage, fallback to 1
  const [page, setPage] = useState(() => {
    if (typeof window !== 'undefined') {
      // First try to get from URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const pageParam = urlParams.get('page');
      if (pageParam) {
        const pageNum = parseInt(pageParam, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          return pageNum;
        }
      }
      
      // Fallback to localStorage
      const savedPage = localStorage.getItem('currentPage');
      if (savedPage) {
        const pageNum = parseInt(savedPage, 10);
        if (!isNaN(pageNum) && pageNum > 0) {
          return pageNum;
        }
      }
    }
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
  useEffect(() => { setHasMounted(true); }, []);

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

  // Reset page when search, filter, or search filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter, selectedFilters]);

  const { data, isLoading, isError, refetch } = usePosts(page, initialData, filter === 'all' ? undefined : filter, debouncedSearch, selectedFilters);
  const posts: Post[] = data?.posts || [];
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    if (page < totalPages && filter === 'all' && (!debouncedSearch || !debouncedSearch.trim())) {
      queryClient.prefetchQuery({
        queryKey: ['posts', page + 1, undefined, debouncedSearch],
        queryFn: async () => {
          const url = new URL(`${API_URL}/posts`);
          url.searchParams.set('page', (page + 1).toString());
          if (debouncedSearch && debouncedSearch.trim()) {
            url.searchParams.set('search', debouncedSearch.trim());
          }
          const res = await fetch(url.toString());
          if (!res.ok) throw new Error('Failed to fetch posts');
          return res.json();
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [page, totalPages, queryClient, filter, debouncedSearch]);

  // Helper to determine selected state
  const isSelected = (id: number) => {
    if (jwt) return userSelected.some(p => p.id === id);
    return selected.some(p => p.id === id);
  };

  // Handle select/unselect for both guest and logged-in user
  const handleSelect = (post: Post) => {
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
      if (!isSelected(post.id) && selected.length >= 20) {
        setSelectError('You can only select up to 20 profiles per session.');
        return;
      }
      setSelectError('');
      setSelected(sel =>
        isSelected(post.id)
          ? sel.filter(p => p.id !== post.id)
          : [...sel, post]
      );
    }
  };

  const getEmailForPost = (postId?: number) => {
    const post = posts.find((p: Post) => p.id === postId);
    return post?.email || '';
  };

  // Show all selected posts at once in 'selected' mode
  const selectedPosts = jwt ? userSelected : selected;
  const showPagination = filter === 'all' || filter === 'bride' || filter === 'groom';
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
        right={
          !hasMounted ? null : (
            jwt ? (
              <div className="flex items-center gap-3">
                <span className="font-serif text-sm text-gray-700 font-medium">
                  Welcome, {userEmail}
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
      {isLoading ? (
        <div className="text-center py-12 text-lg font-serif">Loading matrimonial advertisements...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-600 font-serif">Failed to load advertisements.</div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-5 gap-0 newspaper-masonry">
          {showPosts
            .map((post: Post) => (
              <div key={post.id} className="break-inside-avoid mb-0">
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
      )}
      {showPagination && (
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      )}
      {showPagination && (
        <div className="text-center text-xs text-gray-600 mt-6 font-serif italic">
          Page {page} of {totalPages} | Showing matrimonial advertisements
          {filter === 'bride' && ' (Looking for Bride)'}
          {filter === 'groom' && ' (Looking for Groom)'}
        </div>
      )}
      {filter === 'selected' && (
        <div className="text-center text-xs text-gray-600 mt-6 font-serif italic">
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
    </>
  );
} 