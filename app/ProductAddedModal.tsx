import React, { useEffect } from 'react';
import styles from './css/productaddedmodal.module.css';

interface ProductAddedModalProps {
    name: string;
    image: string;
}

function ProductAddedModal(props: ProductAddedModalProps) {
    return (
    <div className={styles["product-added-modal"]}>
        <p style={{fontWeight: "bold", color: "#102542"}}>Added to Cart!</p>
        <div style={{display: "flex", gap: "0.5rem", marginTop: "0.25rem"}}>
            <img id="addedProductImage" src={props.image} alt={props.name} className={styles["product-image"]}/>
            <div>
                <p id="addedProductName" style={{color: "#102542"}}>{props.name}</p>
                <button className={styles["view-cart-button"]}>
                    View Cart
                </button>
            </div>
        </div>
    </div>
    );
}

export default ProductAddedModal