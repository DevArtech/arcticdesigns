"use client";

import React, { useEffect } from 'react';
import Header from './Header';
import PrimaryModal from './PrimaryModal';
import ProductAddedModal from './ProductAddedModal';
import ReactDOM from 'react-dom/client';
import './css/fira-sans.css'
import './css/globals.css'
import './css/header.module.css'

function Page() {
  
  useEffect(() => {
    document.title = 'Arctic Designs';
  }, []);

  function popProductAdded(name: string, image: string) {
    const docImage = document.getElementById("addedProductImage");
    const docName = document.getElementById("addedProductName");
    const notif = document.getElementById("notification");
    notif.style.opacity = "1";
    if(docImage) {
      docImage.setAttribute("src", image);
      docName.innerHTML = name;
    } else {
      const origin =  document.getElementById("cart");
      const modal = (
        <ProductAddedModal name={name} image={image} />
      );
      const root = ReactDOM.createRoot(origin);
      root.render(modal);
      setTimeout(() => {
        root.unmount();
      }, 2000);
    }
  }

  return (
    <div className="App">
      <Header/>
      <PrimaryModal
        popProductAdded={popProductAdded}
      />
    </div>
  )
}

export default Page;
