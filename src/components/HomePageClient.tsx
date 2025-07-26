"use client";
import React, { useState, useEffect } from 'react';
import Header from './Header';
import NewspaperCard from './NewspaperCard';
import Pagination from './Pagination';
import PostAdDialog from './PostAdDialog';
import EmailDialog from './EmailDialog';
import AuthDialog from './AuthDialog';
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

function usePosts(page: number, initialData: any, lookingFor?: string, search?: string) {
  return useQuery({
    queryKey: ['posts', page, lookingFor, search],
    queryFn: async () => {
      const url = new URL(`${API_URL}/posts`);
      url.searchParams.set('page', page.toString());
      if (lookingFor && lookingFor !== 'all' && lookingFor !== 'selected') {
        url.searchParams.set('lookingFor', lookingFor);
      }
      if (search && search.trim()) {
        url.searchParams.set('search', search.trim());
      }
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error('Failed to fetch posts');
      return res.json();
    },
    initialData: page === 1 && (lookingFor === 'all' || !lookingFor) && (!search || !search.trim()) ? initialData : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export default function HomePageClient({ initialData }: { initialData: any }) {
  const { texts } = useUITexts();
  const [filter, setFilter] = useState<'all' | 'selected' | 'bride' | 'groom'>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500); // 500ms delay
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Post[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('selectedAds');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [selectError, setSelectError] = useState('');
  const [showPostDialog, setShowPostDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState<{ open: boolean; postId?: number }>({ open: false });
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
  const [userSelected, setUserSelected] = useState<Post[]>([]);
  const queryClient = useQueryClient();
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => { setHasMounted(true); }, []);

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

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filter]);

  const { data, isLoading, isError, refetch } = usePosts(page, initialData, filter === 'all' ? undefined : filter, debouncedSearch);
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
        right={
          !hasMounted ? null : (
            jwt ? (
              <button
                className="ui-font bg-gray-200 text-black px-3 py-1 rounded ml-4"
                onClick={() => {
                  setJwt(null);
                  localStorage.removeItem('jwt');
                  setUserSelected([]);
                }}
              >
                {texts.logout}
              </button>
            ) : (
              <button
                className="ui-font bg-black text-white px-3 py-1 rounded ml-4"
                onClick={() => setAuthDialogOpen(true)}
              >
                {texts.login}
              </button>
            )
          )
        }
      />
      {selectError && (
        <div className="text-center text-red-600 mb-2 ui-font">{selectError}</div>
      )}
      {isLoading ? (
        <div className="text-center py-12 text-lg">Loading ads...</div>
      ) : isError ? (
        <div className="text-center py-12 text-red-600">Failed to load ads.</div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-4 gap-4">
          {showPosts
            .map((post: Post) => (
              <div key={post.id} className="mb-4 break-inside-avoid">
                <NewspaperCard
                  content={post.content}
                  selected={isSelected(post.id)}
                  onSelect={() => handleSelect(post)}
                  onEmail={() => setShowEmailDialog({ open: true, postId: post.id })}
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
        <div className="text-center text-xs text-gray-500 mt-4">
          Page {page} of {totalPages} | Showing matrimonial advertisements
          {filter === 'bride' && ' (Looking for Bride)'}
          {filter === 'groom' && ' (Looking for Groom)'}
        </div>
      )}
      {filter === 'selected' && (
        <div className="text-center text-xs text-gray-500 mt-4">
          Showing {selectedPosts.length} selected profile{selectedPosts.length !== 1 ? 's' : ''}
        </div>
      )}
      <PostAdDialog
        open={showPostDialog}
        onClose={() => setShowPostDialog(false)}
        onSuccess={() => refetch()}
      />
      <EmailDialog
        open={showEmailDialog.open}
        onClose={() => setShowEmailDialog({ open: false })}
        toEmail={getEmailForPost(showEmailDialog.postId)}
        lastMsg={lastEmailMsg}
        setLastMsg={setLastEmailMsg}
      />
      <AuthDialog
        open={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        onAuth={token => {
          setJwt(token);
          localStorage.setItem('jwt', token);
          setAuthDialogOpen(false);
        }}
      />
    </>
  );
} 