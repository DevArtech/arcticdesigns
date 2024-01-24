"use client";

import React, { useEffect, useState } from 'react';
import Header from './Header';
import PrimaryModal from './PrimaryModal';
import ProductAddedModal from './ProductAddedModal';
import './css/fira-sans.css'
import './css/globals.css'
import './css/header.module.css'
import CollectionsModal from './CollectionsModal';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductPage from './ProductPage';

function Page() {
  const [isClient, setIsClient] = useState(false);
  const [productAddedData, setProductAddedData] = useState(undefined);

  useEffect(() => {
    document.title = 'Arctic Designs';
    setIsClient(true);
  }, []);

  function popProductAdded(data) {
    setProductAddedData(data);
    setTimeout(() => {
      setProductAddedData(undefined);
    }, 3000);
  }

  return (
    <div className="App">
      <Header />
      {isClient && (
        <Router>
          <Routes>
            <Route path="/" element={
              <>
                <PrimaryModal popProductAdded={popProductAdded} />
                <CollectionsModal popProductAdded={popProductAdded} />
              </>
            } />
            <Route path="/product/:productID" element={
              <ProductPage popProductAdded={popProductAdded}/>
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