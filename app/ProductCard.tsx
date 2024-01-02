import styles from './productcard.module.css';
import React, { useEffect, useState } from 'react';
import { url } from './config/utils';


function ProductCard(props: {name: string, image: string, price: number, rating: number, redirect: string}) {
    const StarRating = (rating: number) => {
        let i = 2.25;
        return (
          <div className={styles.starRating}>
            {[...Array(5)].map(() => {   
                i++;     
                return (       
                    <div>  
                        <span style={{left: `${i}rem`}} className={styles.starUnfilled}>&#9733;</span>    
                        {    
                            i - 2.25 <= rating ? <span style={{left: `${i}rem`}} className={styles.star}>&#9733;</span> : ""
                        }
                    </div>
                );
            })}
          </div>
        );
      };      

    return (
    <div className={styles.productCard}>
        <img src={props.image} alt={props.name} className={styles.productImage}/>
        <p style={{fontWeight : "bold"}}>{props.name}</p>
        <p>{`$${(props.price / 100).toFixed(2)}`}</p>
        <p>{StarRating(props.rating)}</p>
    </div>
    );
}

export default ProductCard;