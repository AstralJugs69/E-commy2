<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const email = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const isLoading = ref(false);

// Define API Base URL (consider moving to config later)
const API_BASE_URL = 'http://localhost:3001/api'; // Adjust port if needed

const handleLogin = async () => {
  // 1. Reset error message, set loading state
  errorMessage.value = null;
  isLoading.value = true;

  // 2. Basic frontend validation
  if (!email.value || !password.value) {
    errorMessage.value = 'Email and password are required.';
    isLoading.value = false;
    return;
  }

  try {
    // 3. Make POST request to backend login endpoint using Axios
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: email.value,
      password: password.value,
    });

    // 4. On Success (e.g., status 200)
    if (response.data && response.data.token) {
      localStorage.setItem('admin_token', response.data.token); // Simple storage for now
      console.log('Login successful! Token:', response.data.token);
      // alert('Login Successful!'); // Temporary feedback
      // Future: router.push('/admin/dashboard');
    } else {
      // Handle unexpected success response format
      errorMessage.value = 'Login failed: Invalid response from server.';
    }
  } catch (error: any) {
    // 5. On Error
    if (axios.isAxiosError(error) && error.response) {
      errorMessage.value = error.response.data.message || 'Login failed. Please check credentials.';
    } else {
      errorMessage.value = 'Login failed: Network or server error.';
      console.error('Login Error:', error);
    }
  } finally {
    // 6. Reset loading state regardless of success/failure
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Login
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to access the admin panel
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email-address" class="sr-only">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="email"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="password"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                {{ errorMessage }}
              </h3>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ isLoading ? 'Logging in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 