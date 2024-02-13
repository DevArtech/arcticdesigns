"use client";

import './css/fira-sans.css'
import './css/globals.css'
import './css/header.module.css'
import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import { url } from './config/utils';
import SignUpPage from './SignUpPage';
import ProductPage from './ProductPage';
import PrimaryModal from './PrimaryModal';
import ProductSearch from "./ProductSearch";
import CollectionsModal from './CollectionsModal';
import ProductAddedModal from './ProductAddedModal';
import GoogleSignUpFinalization from './GoogleSignUpFinalization';

function Page() {
  const [isClient, setIsClient] = useState(false);
  const [productAddedData, setProductAddedData] = useState(undefined);
  const [userData, setUserData] = useState<{name: string, token: string}>();
  const [hasCartItem, setHasCartItem] = useState(false);

  function signOutUser() {
    localStorage.removeItem('user-data');
    setUserData(undefined);
  }

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
    if(userData === undefined) {
      window.location.href = "/#/sign-up";
      return;
    }
    const addToCart = async () => {
      const response = await fetch(url('/api/accounts/add-to-cart'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({product_id: data.id, token: userData.token})
      });
      if(response.status == 401) {
        signOutUser();
        window.location.href = "/#/sign-up";
        return;
      } else if(response.status == 200) {
        const result = await response.json();
        if(result) {
          setProductAddedData(data);
          setHasCartItem(true);
          setTimeout(() => {
            setProductAddedData(undefined);
          }, 3000);
        }
      }
    }
    addToCart();
  }

  return (
    <div className="App">
      {isClient && (
        <Router>
          <Routes>
            <Route path="/" element={
              <>
                <Header userData={userData} hasCartItem={hasCartItem}/>
                <PrimaryModal popProductAdded={popProductAdded} />
                <CollectionsModal popProductAdded={popProductAdded} />
              </>
            } />
            <Route path="/product/:productID" element={
              <>
                <Header userData={userData} hasCartItem={hasCartItem}/>
                <ProductPage userData={userData} popProductAdded={popProductAdded} signOutUser={signOutUser}/>
                <CollectionsModal popProductAdded={popProductAdded} />
              </>
            }/>
             <Route path="/sign-up" element={
              <>
                <Header userData={userData} hasCartItem={hasCartItem}/>
                <SignUpPage/>
              </>
            }/>
            <Route path="/login" element={
              <GoogleSignUpFinalization/>
            }/>
            <Route path="/products" element={
              <>
                <Header userData={userData} hasCartItem={hasCartItem}/>
                <ProductSearch popProductAdded={popProductAdded} />
              </>
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