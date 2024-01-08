import styles from './productcard.module.css';
import React, { useEffect, useState } from 'react';
import ColorSelector from './ColorSelector';

interface ProductCardProps {
    name: string;
    image: string;
    price: number;
    rating: number;
    colorOptions: string[]
    redirect: string;
    largeCard: boolean;
};


function ProductCard(props: ProductCardProps) {
    const StarRating = (rating: number, isLargeCard: boolean) => {
        let i = 1.1;
        if(isLargeCard) {
            i = 6.1;
        }
        return (
          <div className={styles["star-rating"]}>
            {[...Array(5)].map(() => {   
                i++;     
                return (       
                    <div key={isLargeCard ? i - 1.1 : i - 6.1}>  
                        <span style={{left: `${i}rem`}} className={styles["star-unfilled"]}>&#9733;</span>    
                        {    
                            (isLargeCard ? i - 6.1 : i - 1.1) <= rating ? <span style={{left: `${i}rem`}} className={styles["star"]}>&#9733;</span> : ""
                        }
                    </div>
                );
            })}
          </div>
        );
      };      

    return (
    <div className={props.largeCard ? styles["product-card-large"] : styles["product-card"]}>
        <img src={props.image} alt={props.name} className={styles["product-image"]}/>
        <div className={styles["name-container"]}>
            <p className={styles["name"]}>{props.name}</p>
        </div>
        {
            props.largeCard ? <p style={{fontWeight : "bold", color : "#48B8FE"}}>Recommended for You</p> : ""
        }
        <p>{`$${(props.price / 100).toFixed(2)}`}</p>
        {StarRating(props.rating, props.largeCard)}
        <div style={{display : "flex", marginTop: props.largeCard ? "0.25rem" : "2rem", width: "100%", justifyContent: "space-around"}}>
                <ColorSelector
                    options={props.colorOptions}/>
                <button className={styles["add-to-cart-button"]}>
                    <svg className={styles["add-to-cart-icon"]} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                        <defs/>
                        <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                            <path d="M 72.975 58.994 H 31.855 c -1.539 0 -2.897 -1.005 -3.347 -2.477 L 15.199 13.006 H 3.5 c -1.933 0 -3.5 -1.567 -3.5 -3.5 s 1.567 -3.5 3.5 -3.5 h 14.289 c 1.539 0 2.897 1.005 3.347 2.476 l 13.309 43.512 h 36.204 l 10.585 -25.191 h -6.021 c -1.933 0 -3.5 -1.567 -3.5 -3.5 s 1.567 -3.5 3.5 -3.5 H 86.5 c 1.172 0 2.267 0.587 2.915 1.563 s 0.766 2.212 0.312 3.293 L 76.201 56.85 C 75.655 58.149 74.384 58.994 72.975 58.994 z" className={styles["add-to-cart-icon"]} />
                            <circle cx="28.88" cy="74.33" r="6.16" className={styles["add-to-cart-icon"]} />
                            <circle cx="74.59" cy="74.33" r="6.16" className={styles["add-to-cart-icon"]} />
                            <path d="M 62.278 19.546 H 52.237 V 9.506 c 0 -1.933 -1.567 -3.5 -3.5 -3.5 s -3.5 1.567 -3.5 3.5 v 10.04 h -10.04 c -1.933 0 -3.5 1.567 -3.5 3.5 s 1.567 3.5 3.5 3.5 h 10.04 v 10.04 c 0 1.933 1.567 3.5 3.5 3.5 s 3.5 -1.567 3.5 -3.5 v -10.04 h 10.041 c 1.933 0 3.5 -1.567 3.5 -3.5 S 64.211 19.546 62.278 19.546 z" className={styles["add-to-cart-icon"]} />
                        </g>
                    </svg>
                </button>
            </div>
    </div>
    );
}

export default ProductCard;