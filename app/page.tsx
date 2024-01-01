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
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;700&display=swap');
      </style>
      <Header/>
    </div>
  )
}

export default Page;
