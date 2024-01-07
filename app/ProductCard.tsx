import styles from './productcard.module.css';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface ProductCardProps {
    name: string;
    image: string;
    price: number;
    rating: number;
    redirect: string;
};


function ProductCard(props: ProductCardProps) {
    const StarRating = (rating: number) => {
        let i = 2.25;
        return (
          <div className={styles["star-rating"]}>
            {[...Array(5)].map(() => {   
                i++;     
                return (       
                    <div key={i - 2.25}>  
                        <span style={{left: `${i}rem`}} className={styles["star-unfilled"]}>&#9733;</span>    
                        {    
                            i - 2.25 <= rating ? <span style={{left: `${i}rem`}} className={styles["star"]}>&#9733;</span> : ""
                        }
                    </div>
                );
            })}
          </div>
        );
      };      

    return (
    <div className={styles["product-card"]}>
        <img src={props.image} alt={props.name} className={styles["product-image"]}/>
        <p style={{fontWeight : "bold"}}>{props.name}</p>
        <p>{`$${(props.price / 100).toFixed(2)}`}</p>
        <p>{StarRating(props.rating)}</p>
    </div>
    );
}

export default ProductCard;