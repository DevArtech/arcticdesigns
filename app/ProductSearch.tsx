import { useEffect, useState } from "react";
import styles from "./css/productsearch.module.css";
import { url } from "./config/utils";
import LoadingSpinner from "./LoadingSpinner";
import ProductCard from "./ProductCard";
import AvailableColor from "./utils/availablecolors";

interface ProductSearchProps {
    popProductAdded(data: {id: string, name: string, image: string, color: string}): void;
}

function ProductSearch(props: ProductSearchProps) {
    const [availableColors, setAvailableColors] = useState<AvailableColor[]>([]);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearchResults, foundSearchResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchBarPlaceholder, setSearchBarPlaceholder] = useState("");
    const [searchbarValue, setSearchbarValue] = useState("");

    useEffect(() => {
        const searchBar = document.getElementById("productSearchBar");
        async function fetchData() {
          const response = await fetch(url("/api/products/total-count"), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const productCount = await response.json();
          setSearchBarPlaceholder(`Search from ${productCount} products`)

        const initialProducts = await fetch(url(`/api/products/get-random-products/12`), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
        });
        if (response.status == 200) {
            const searchResults = await initialProducts.json();
            let i = 0;
            let mappedProductCards = searchResults.map((product: {prod_id: string, name: string, images: string[], price: number, rating: number, redirect: string, colors: string[]}) => {
                i++;
                foundSearchResults(true);
                return <ProductCard 
                        key={product.prod_id}
                        id={product.prod_id}
                        name={product.name} 
                        image={product.images[0]} 
                        price={product.price} 
                        rating={product.rating} 
                        colorOptions={product.colors}
                        availableColors={availableColors}
                        redirect={`/product/${product.prod_id}`}
                        largeCard={false}
                        popProductAdded={props.popProductAdded}/>    
            });
            setSearchResults(mappedProductCards);
        }
        }
    
        fetchData();
    }, []);

    useEffect(() => {
        async function getAvailableColors() {
            const headerObject = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const colorResponse = await fetch(url("/api/misc-data/available-colors"), headerObject);
            const colorData = await colorResponse.json();
            const availableColors: AvailableColor[] = Object.entries(colorData).map(([color, availability]) => ({
                color: color as string,
                available: availability as boolean
            }));
            setAvailableColors(availableColors);
        }
        getAvailableColors();
    }, []);


    function submitField(event) {
        if(event.key === "Enter") {
            searchForProducts();
        }
    }

    function searchForProducts() {
        setLoading(true);
        foundSearchResults(false);
        async function fetchData() {
            const headers = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({query: searchbarValue})
            }
            const response = await fetch(url(`/api/products/search`), headers);
            if (response.status == 200) {
                const searchResults = await response.json();
                let i = 0;
                let mappedProductCards = searchResults.map((product: {prod_id: string, name: string, images: string[], price: number, rating: number, redirect: string, colors: string[]}) => {
                    i++;
                    foundSearchResults(true);
                    return <ProductCard 
                            key={product.prod_id}
                            id={product.prod_id}
                            name={product.name} 
                            image={product.images[0]} 
                            price={product.price} 
                            rating={product.rating} 
                            colorOptions={product.colors}
                            availableColors={availableColors}
                            redirect={`/product/${product.prod_id}`}
                            largeCard={false}
                            popProductAdded={props.popProductAdded}/>    
                });
                setSearchResults(mappedProductCards);
            }
            setLoading(false);
        }
        fetchData();
    }
    
    return <div className={styles["product-search"]}>
        <div className={styles["search-input"]}>
            <svg className={styles["search-icon"]} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                <defs/>
                <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)" >
                    <path d="M 87.803 77.194 L 68.212 57.602 c 9.5 -14.422 7.912 -34.054 -4.766 -46.732 c 0 0 -0.001 0 -0.001 0 c -14.495 -14.493 -38.08 -14.494 -52.574 0 c -14.494 14.495 -14.494 38.079 0 52.575 c 7.248 7.247 16.767 10.87 26.287 10.87 c 7.134 0 14.267 -2.035 20.445 -6.104 l 19.591 19.591 C 78.659 89.267 80.579 90 82.498 90 s 3.84 -0.733 5.305 -2.197 C 90.732 84.873 90.732 80.124 87.803 77.194 z M 21.48 52.837 c -8.645 -8.646 -8.645 -22.713 0 -31.358 c 4.323 -4.322 10 -6.483 15.679 -6.483 c 5.678 0 11.356 2.161 15.678 6.483 c 8.644 8.644 8.645 22.707 0.005 31.352 c -0.002 0.002 -0.004 0.003 -0.005 0.005 c -0.002 0.002 -0.003 0.003 -0.004 0.005 C 44.184 61.481 30.123 61.48 21.48 52.837 z" transform=" matrix(1 0 0 1 0 0) " strokeLinecap="round" />
                </g>
            </svg>
            <input onKeyDown={submitField} onChange={(event) => setSearchbarValue(event.target.value)} id="productSearchBar" className={styles["search-bar"]} type="text" placeholder={searchBarPlaceholder} />
            {
                loading ? <LoadingSpinner color={"#102542"} solid={false} noBottomPadding={true}/> : ""
            }
            <button onClick={searchForProducts} className={styles["search-enter"]}>Search</button>
        </div>
        <div style={{justifyContent: hasSearchResults ? "left" : "center"}} className={styles["search-results"]}>
            {
                hasSearchResults ? searchResults : !loading ?
                <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <img style={{width: "5rem", height: "auto"}} src="../pikachu.svg" alt="" />
                    <p style={{textAlign: "center", color: "#616768"}}>No results found...</p>
                </div> : ""
            }
        </div>
    </div>;
}

export default ProductSearch;