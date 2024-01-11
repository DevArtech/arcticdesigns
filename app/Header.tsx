// Header.js
import styles from './css/header.module.css';
import React, { useEffect, useState } from 'react';
import { url } from './config/utils';

function Header() {

  const [searchBarPlaceholder, setSearchBarPlaceholder] = useState("");
  const [isMenuClosed, setIsMenuClosed] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);

  useEffect(() => {
    if(!pageLoaded) {
      if (window.innerWidth > 700) {
        setIsMenuClosed(false);
      } else {
        setIsMenuClosed(true);
      }
      setPageLoaded(true);
    }}, [pageLoaded])

  useEffect(() => {
    window.addEventListener('resize', function() {
      if (window.innerWidth > 700) {
        setIsMenuClosed(false);
      } else {
        setIsMenuClosed(true);
      }
  });})

  const toggleMenu = () => {
    if (window.innerWidth >= 700) {
      setIsMenuClosed(false);
    } else {
      setIsMenuClosed(!isMenuClosed);
    }
  };

  function toggleSearchBar() {
    const button = document.getElementById('toggleSearchButton') as HTMLButtonElement;
    if(button) {
      button.disabled = true;
    }
    const searchBar = document.getElementById("searchInputField");
    if(searchBar) {
      if(searchBar.style.width === "15rem") {
        searchBar.blur();
        searchBar.style.width = "0";
        searchBar.style.opacity = "0";
        searchBar.style.paddingLeft = "0";
      } else {
        const searchInputField = searchBar as HTMLInputElement;
        searchInputField.value = "";
        searchBar.style.width = "15rem";
        searchBar.style.opacity = "1";
        searchBar.style.paddingLeft = "1rem";
        searchBar.focus();
      }
    }
    setTimeout(() => {
      if(button) {
        button.disabled = false;
      }
    }, 100);
  }

  useEffect(() => {
    const searchBar = document.getElementById("searchInputField");
    const handleBlur = () => toggleSearchBar();
    async function fetchData() {
      const response = await fetch(url("/api/products/total-count"), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const productCount = await response.json();
      setSearchBarPlaceholder(`Search from ${productCount} products`)
    }

    fetchData();
    if (searchBar) {
      searchBar.addEventListener('blur', handleBlur);
    }

    return () => {
      if (searchBar) {
        searchBar.removeEventListener('blur', handleBlur);
      }
    };
  }, []);


  return (
    <div className={styles["header"]}>
      {/* Left side menu */}
      <div>
        <a className={styles["header-logo"]} href="/">Arctic Designs</a>
      </div>

      {/* Hamburger menu */}
      <div className={`${styles["hamburger-menu"]} ${isMenuClosed ? '' : styles["active"]}`} onClick={toggleMenu}>
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Right side menu */}
      <div className={`${styles["right-header"]} ${isMenuClosed ? styles["hide-menu"] : ''}`}>
        <div className={styles["header-options"]}>
          <a className={styles["header-link"]} href="/products">Products</a>
          <a className={styles["header-link"]} href="/blog">Blog</a>
          <a className={styles["header-link"]} href="/contact">Contact</a>
        </div>
        <div className={styles["search-bar"]}>
        <input id="searchInputField" type="text" placeholder={searchBarPlaceholder}></input>
          <button id="toggleSearchButton" onClick={toggleSearchBar}>
            <svg className={styles["search-icon"]} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
              <defs>
              </defs>
              <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
                <path d="M 87.803 77.194 L 68.212 57.602 c 9.5 -14.422 7.912 -34.054 -4.766 -46.732 c 0 0 -0.001 0 -0.001 0 c -14.495 -14.493 -38.08 -14.494 -52.574 0 c -14.494 14.495 -14.494 38.079 0 52.575 c 7.248 7.247 16.767 10.87 26.287 10.87 c 7.134 0 14.267 -2.035 20.445 -6.104 l 19.591 19.591 C 78.659 89.267 80.579 90 82.498 90 s 3.84 -0.733 5.305 -2.197 C 90.732 84.873 90.732 80.124 87.803 77.194 z M 21.48 52.837 c -8.645 -8.646 -8.645 -22.713 0 -31.358 c 4.323 -4.322 10 -6.483 15.679 -6.483 c 5.678 0 11.356 2.161 15.678 6.483 c 8.644 8.644 8.645 22.707 0.005 31.352 c -0.002 0.002 -0.004 0.003 -0.005 0.005 c -0.002 0.002 -0.003 0.003 -0.004 0.005 C 44.184 61.481 30.123 61.48 21.48 52.837 z" transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
              </g>
            </svg>
          </button>
        </div>
        <a href="/cart" className={styles["cart"]}>
          <svg width="2rem" height="2rem" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path className={styles["cart-icon"]} d="M11.25 18.75C11.25 19.58 10.58 20.25 9.75 20.25C8.92 20.25 8.25 19.58 8.25 18.75C8.25 17.92 8.92 17.25 9.75 17.25C10.58 17.25 11.25 17.92 11.25 18.75ZM16.25 17.25C15.42 17.25 14.75 17.92 14.75 18.75C14.75 19.58 15.42 20.25 16.25 20.25C17.08 20.25 17.75 19.58 17.75 18.75C17.75 17.92 17.08 17.25 16.25 17.25ZM20.73 7.68L18.73 15.68C18.65 16.01 18.35 16.25 18 16.25H8C7.64 16.25 7.33 15.99 7.26 15.63L5.37 5.25H4C3.59 5.25 3.25 4.91 3.25 4.5C3.25 4.09 3.59 3.75 4 3.75H6C6.36 3.75 6.67 4.01 6.74 4.37L7.17 6.75H20C20.23 6.75 20.45 6.86 20.59 7.04C20.73 7.22 20.78 7.46 20.73 7.68ZM19.04 8.25H7.44L8.62 14.75H17.41L19.04 8.25Z"/>
            <circle id="notification" cx="20.5" cy="6" r="3" className={styles["cart-notification"]}/>
          </svg>
          <div id="cart"></div>
        </a>
        <button className={styles["sign-in-button"]}>
          Sign Up
        </button>
      </div>
    </div>
  );
}

export default Header;