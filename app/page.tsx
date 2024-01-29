"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import PrimaryModal from './PrimaryModal';
import ProductAddedModal from './ProductAddedModal';
import './css/fira-sans.css'
import './css/globals.css'
import './css/header.module.css'
import CollectionsModal from './CollectionsModal';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ProductPage from './ProductPage';
import SignUpPage from './SignUpPage';
import GoogleSignUpFinalization from './GoogleSignUpFinalization';

function Page() {
  const [isClient, setIsClient] = useState(false);
  const [productAddedData, setProductAddedData] = useState(undefined);
  const [userData, setUserData] = useState<{name: string, token: string}>();

  useEffect(() => {
    document.title = 'Arctic Designs';
    setIsClient(true);
    const savedData = JSON.parse(localStorage.getItem('user-data') || 'null');
    if (savedData != null) {
      setUserData(savedData);
    } else {
      setUserData(undefined);
    }
  }, []);

  function popProductAdded(data) {
    setProductAddedData(data);
    setTimeout(() => {
      setProductAddedData(undefined);
    }, 3000);
  }

  return (
    <div className="App">
      {isClient && (
        <Router>
          <Routes>
            <Route path="/" element={
              <>
                <Header userData={userData}/>
                <PrimaryModal popProductAdded={popProductAdded} />
                {/* <CollectionsModal popProductAdded={popProductAdded} /> */}
              </>
            } />
            <Route path="/product/:productID" element={
              <>
                <Header userData={userData}/>
                <ProductPage userData={userData} popProductAdded={popProductAdded}/>
                <CollectionsModal popProductAdded={popProductAdded} />
              </>
            }/>
             <Route path="/sign-up" element={
              <>
                <Header userData={userData}/>
                <SignUpPage/>
              </>
            }/>
            <Route path="/login" element={
              <GoogleSignUpFinalization/>
            }/>
          </Routes>
        </Router>
      )}
      {productAddedData &&
        <ProductAddedModal
          data={productAddedData}
        />
      }
    </div>
  );
}

export default Page;