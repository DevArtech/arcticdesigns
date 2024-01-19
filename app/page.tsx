"use client";

import React, { useEffect } from 'react';
import Header from './Header';
import PrimaryModal from './PrimaryModal';
import ProductAddedModal from './ProductAddedModal';
import ReactDOM from 'react-dom/client';
import './css/fira-sans.css'
import './css/globals.css'
import './css/header.module.css'
import CollectionsModal from './CollectionsModal';

function Page() {
  
  useEffect(() => {
    document.title = 'Arctic Designs';
  }, []);

  function popProductAdded(data: {name: string, image: string, color: string}) {
    const docImage = document.getElementById("addedProductImage");
    const docName = document.getElementById("addedProductName");
    const docColor = document.getElementById("addedProductColor");
    const notif = document.getElementById("notification");

    const name = data["name"];
    const image = data["image"];
    const color = data["color"];

    notif.style.fill = "#F7F4F3FF";
    notif.style.stroke = "#F7F4F3FF";
    if(docImage) {
      docImage.setAttribute("src", image);
      docName.innerHTML = name;
      docColor.innerHTML = "Color: " + color;
    } else {
      const origin =  document.getElementById("cart");
      const modal = (
        <ProductAddedModal name={name} image={image} color={color}/>
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
      <CollectionsModal
        popProductAdded={popProductAdded}
      />
    </div>
  )
}

export default Page;
