"use client";

import React, { useEffect } from 'react';
import Header from './Header';
import './globals.css'

function Page() {
  useEffect(() => {
    document.title = 'Arctic Designs';
  }, []);

  return (
    <div className="App">
      <Header/>
    </div>
  )
}

export default Page;
