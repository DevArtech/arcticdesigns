import styles from './primarymodal.module.css';
import React, { useEffect, useState } from 'react';
import { url } from './config/utils';
import ProductCard from './ProductCard'
import { init } from 'next/dist/compiled/webpack/webpack';

function PrimaryModal() {

    const [searchBarPlaceholder, setSearchBarPlaceholder] = useState("");
    const [productCards, setProductCards] = useState<React.ReactNode[]>([]);
    const [initialLoad, setInitialLoad] = useState(false);

    useEffect(() => {
        const searchBar = document.getElementById("searchInputField");
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
    }, []);

    useEffect(() => {
        if(!initialLoad) {
            generateProductCards();
            setInitialLoad(true);
        }
    }, [initialLoad]);

    function generateProductCards() {
        async function fetchData() {
            const response = await fetch(url("/api/products/get-random-products"), {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            });
            const products = await response.json();
            const mappedProductCards = products.map((product: {name: string, images: Array<string>, price: number, rating: number, redirect: string}) => {
                return <ProductCard name={product.name} image={product.images[0]} price={product.price} rating={product.rating} redirect={"/"}/>
            });
            setProductCards(productCards.length <= 0 ? mappedProductCards : productCards);
        }
        fetchData();
    }

    return (
        <div className={styles.primaryModal}>
            <div className={styles.innerElements}>
                <div className={styles.modalElements}>
                    <h1 className={styles.modalTag}>Printer to Home</h1>
                    <p className={styles.modalAddText}>Quality 3D printed products delivered straight to you.</p>
                    <a href="/products" className={styles.visitShopButton}>
                        <p style={{position: 'absolute', margin: '0.4rem 3.75rem'}}>Visit Shop</p>
                        <div className={styles.visitShopModalBorder}></div>
                    </a>
                    <div style={{width: '110%', display : 'flex', marginTop: '1.25rem', gap: '0.5rem'}}>
                    <button className={styles.searchBar}>
                        <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                            <defs/>
                            <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
                                <path d="M 87.803 77.194 L 68.212 57.602 c 9.5 -14.422 7.912 -34.054 -4.766 -46.732 c 0 0 -0.001 0 -0.001 0 c -14.495 -14.493 -38.08 -14.494 -52.574 0 c -14.494 14.495 -14.494 38.079 0 52.575 c 7.248 7.247 16.767 10.87 26.287 10.87 c 7.134 0 14.267 -2.035 20.445 -6.104 l 19.591 19.591 C 78.659 89.267 80.579 90 82.498 90 s 3.84 -0.733 5.305 -2.197 C 90.732 84.873 90.732 80.124 87.803 77.194 z M 21.48 52.837 c -8.645 -8.646 -8.645 -22.713 0 -31.358 c 4.323 -4.322 10 -6.483 15.679 -6.483 c 5.678 0 11.356 2.161 15.678 6.483 c 8.644 8.644 8.645 22.707 0.005 31.352 c -0.002 0.002 -0.004 0.003 -0.005 0.005 c -0.002 0.002 -0.003 0.003 -0.004 0.005 C 44.184 61.481 30.123 61.48 21.48 52.837 z" transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                            </g>
                        </svg>
                        <span/>
                            <input className={styles.searchInputField} type="text" placeholder={searchBarPlaceholder}/>
                    </button>
                    <button className={styles.searchButton}>Search</button>
                    </div>
                </div>
                <div className={styles.productCards}>
                    { productCards }
                </div>
                <img className={styles.modalBackground} src="/primary-modal-background.png" alt="Collection of 3D printed items on a blue background" />
            </div>
        </div>
    );
}

export default PrimaryModal;