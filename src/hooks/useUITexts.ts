import { useQuery } from '@tanstack/react-query';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

// Default fallback texts in case API fails
const defaultTexts = {
  select: 'Select',
  unselect: 'Unselect',
  email: 'Email',
  yourEmail: 'Your Email',
  receiverEmail: 'Receiver Email',
  message: 'Message',
  postAd: 'Post Your Ad',
  adContent: 'Describe yourself or your requirement',
  sendEmail: 'Send Email',
  cancel: 'Cancel',
  close: 'Close',
  submit: 'Submit',
  login: 'Login',
  register: 'Register',
  logout: 'Logout',
  emailPlaceholder: 'Enter your email address',
  messagePlaceholder: 'Type your message here...',
  contentPlaceholder: 'Describe yourself, your requirements, or the person you are looking for...',
  requestOtp: 'Request OTP',
  verifyOtp: 'Verify OTP',
  otpPlaceholder: 'Enter 6-digit OTP',
  password: 'Password',
  passwordPlaceholder: 'Enter your password',
  confirmPassword: 'Confirm Password',
  confirmPasswordPlaceholder: 'Confirm your password',
  filterAll: 'All',
  filterSelected: 'Selected',
  filterBride: 'Looking for Bride',
  filterGroom: 'Looking for Groom',
};

// Fetch UI texts from API
const fetchUITexts = async () => {
  try {
    const response = await fetch(`${API_URL}/ui-texts`);
    if (response.ok) {
      const data = await response.json();
      // Merge with defaults to ensure all keys exist
      return { ...defaultTexts, ...data.texts };
    } else {
      console.warn('Failed to fetch UI texts, using defaults');
      return defaultTexts;
    }
  } catch (err) {
    console.warn('Error fetching UI texts, using defaults:', err);
    return defaultTexts;
  }
};

export function useUITexts() {
  const { data: texts = defaultTexts, isLoading: loading, error } = useQuery({
    queryKey: ['ui-texts'],
    queryFn: fetchUITexts,
    staleTime: 1 * 60 * 1000, // 1 minute cache
    gcTime: 5 * 60 * 1000, // 5 minutes cache
    retry: 2,
    retryDelay: 1000,
  });

  return { 
    texts, 
    loading, 
    error: error ? 'Failed to load UI texts' : null 
  };
} 