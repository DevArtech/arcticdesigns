import styles from './productcard.module.css';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface ProductCardProps {
    name: string;
    image: string;
    price: number;
    rating: number;
    redirect: string;
    largeCard: boolean;
};


function ProductCard(props: ProductCardProps) {
    const StarRating = (rating: number, isLargeCard: boolean) => {
        let i = 1.25;
        if(isLargeCard) {
            i = 6.25;
        }
        return (
          <div className={styles["star-rating"]}>
            {[...Array(5)].map(() => {   
                i++;     
                return (       
                    <div key={isLargeCard ? i - 2.25 : i - 6.25}>  
                        <span style={{left: `${i}rem`}} className={styles["star-unfilled"]}>&#9733;</span>    
                        {    
                            (isLargeCard ? i - 6.25 : i - 2.25) <= rating ? <span style={{left: `${i}rem`}} className={styles["star"]}>&#9733;</span> : ""
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
            props.largeCard ? <p style={{fontWeight : "bold", color : "#102542"}}>Recommended for You</p> : ""
        }
        <p>{`$${(props.price / 100).toFixed(2)}`}</p>
        <p>{StarRating(props.rating, props.largeCard)}</p>
    </div>
    );
}

export default ProductCard;