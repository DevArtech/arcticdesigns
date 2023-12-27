"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import LoginForm from './LoginForm';

function page() {

  return (
    <div className="App">
      <h1>Login Form</h1>
      <LoginForm />
    </div>
  )
}

export default page;