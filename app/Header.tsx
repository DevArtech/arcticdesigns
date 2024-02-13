// Header.js
import styles from './css/header.module.css';
import React, { useEffect, useState } from 'react';
import { url } from './config/utils';
import { Link } from 'react-router-dom';

interface ProductPageProps {
  userData: {name: string};
  hasCartItem: boolean;
}

function Header(props: ProductPageProps) {

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

  function signOut() {
    localStorage.removeItem("user-data");
    window.location.href = "/";
  }

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
          <a className={styles["header-link"]} href="/#/products">Products</a>
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
            <path className={styles["cart-icon"]} d="M 9.464 19.695 C 9.464 20.525 8.794 21.195 7.964 21.195 C 7.134 21.195 6.464 20.525 6.464 19.695 C 6.464 18.865 7.134 18.195 7.964 18.195 C 8.794 18.195 9.464 18.865 9.464 19.695 Z M 18.009 18.195 C 17.179 18.195 16.509 18.865 16.509 19.695 C 16.509 20.525 17.179 21.195 18.009 21.195 C 18.839 21.195 19.509 20.525 19.509 19.695 C 19.509 18.865 18.839 18.195 18.009 18.195 Z M 20.73 7.68 L 18.73 15.68 C 18.65 16.01 18.35 16.25 18 16.25 L 8 16.25 C 7.64 16.25 7.33 15.99 7.26 15.63 L 5.37 5.25 L 3.002 5.25 C 2.592 5.25 2.252 4.91 2.252 4.5 C 2.252 4.09 2.592 3.75 3.002 3.75 L 6 3.75 C 6.36 3.75 6.67 4.01 6.74 4.37 L 7.17 6.75 L 20 6.75 C 20.23 6.75 20.45 6.86 20.59 7.04 C 20.73 7.22 20.78 7.46 20.73 7.68 Z M 19.04 8.25 L 7.44 8.25 L 8.62 14.75 L 17.41 14.75 L 19.04 8.25 Z"/>
            {
              props.hasCartItem ? <circle id="notification" cx="20.5" cy="6" r="3" className={styles["cart-notification"]}/> : ""
            }
          </svg>
          <div id="cart"></div>
        </a>
        {
            props.userData == undefined ?
            <nav>
              <Link to="/sign-up">
                <div className={styles["sign-in-button"]}>
                  Sign Up
                </div>
              </Link>
            </nav> : <button className={styles["username"]} onClick={signOut}>
              Hello {props.userData.name}!
              </button>
        }
      </div>
    </div>
  );
}

export default Header;