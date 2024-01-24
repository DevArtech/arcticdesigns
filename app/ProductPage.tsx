import { useParams } from 'react-router-dom';
import { url } from './config/utils';
import { FormEvent, useEffect, useState } from 'react';
import styles from "./css/productpage.module.css";
import Carousel from 'react-multi-carousel';
import DOMPurify from 'dompurify';
import ColorSelector from './ColorSelector';
import AvailableColor from './utils/availablecolors';

interface RouteParams {
    productID: string;
    [key: string]: string;
}

interface ProductPageProps {
    popProductAdded(data: {name: string, image: string, color: string}): void;
    userData: {name: string}
}

function ProductPage(props: ProductPageProps) {
    const { productID } = useParams<RouteParams>();
    const [selectedColor, setSelectedColor] = useState('');
    const [inputValue, setInputValue] = useState<string>('');
    const [errorAddingComment, setErrorAddingComment] = useState(false);
    const [availableColors, setAvailableColors] = useState<AvailableColor[]>([]);
    const [productData, setProductData] = useState<{colors: string[], comments: any[], 
        dateAdded: string, description: string, images: any[], name: string, price: number, 
        prod_id: string, rating: number, tags: string[]}>();

    const responsive = {
        desktop: {
            breakpoint: { max: 3000, min: 1024 },
            items: 1,
            slidesToSlide: 1
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 1,
            slidesToSlide: 1
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
            slidesToSlide: 1
        }
    };

    function convertLinksToAnchors(text: string): string {
        const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%=~_|$?!:,.]*[A-Z0-9+&@#/%=~_|$])/ig;
        text = DOMPurify.sanitize(text)
        return text.replace(urlRegex, function(url) {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
    }

    function formatDate(dateStr: string): string {
        const date = new Date(dateStr);
        let day = date.getDate().toString();
        let month = (date.getMonth() + 1).toString();
        let year = date.getFullYear().toString().slice(-2);
        let hours = date.getHours();
        let minutes = date.getMinutes().toString();
    
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        let hoursStr = hours.toString();
    
        month = month.length < 2 ? '0' + month : month;
        day = day.length < 2 ? '0' + day : day;
        minutes = minutes.length < 2 ? '0' + minutes : minutes;
    
        return `${month}/${day}/${year} - ${hoursStr}:${minutes} ${ampm}`;
    }
    
    
    useEffect(() => {
        async function fetchData() {
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

            const response = await fetch(url(`/api/products/get-product/${productID.toString()}`), headerObject);
            const productData = await response.json();
            const images = productData.images.map((image, index) => (
                <img src={image} alt={productData.name} key={index} className={styles["product-image"]}/>
            ))
            const tags = productData.tags.map((tag, index) => {
                return (
                    <p key={index} className={styles["tag"]}>{tag}</p>
                )
            })
            const comments = productData.comments[0] == undefined ?
                <div className={styles["no-comments"]}> 
                    <img style={{width: "5rem", height: "auto"}} src="../pikachu.svg" alt="" />
                    Wow! No comments available
                </div> :
                productData.comments.map((comment, index) => {
                    return (
                        <div key={index} className={styles["comment"]}>
                            <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                                <p className={styles["comment-name"]}>{comment.name}</p>
                                <p className={styles["comment-date"]}>{formatDate(comment.date)}</p>
                            </div>
                            <p className={styles["comment-text"]}>{comment.text}</p>
                        </div>
                    )})
            productData.images = images;
            productData.tags = tags;
            productData.comments = comments;
            setProductData(productData);
            const page = document.getElementById("product")
            page.style.opacity = "1";
            page.style.transform = "none";
        }
        fetchData();
    }, [productID]);

    const StarRating = (rating: number) => {
        return (
          <div className={styles["star-rating"]}>
            <span className={styles["stars-unfilled"]}>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            <div style={{width : `${rating - 0.6}em`}} className={styles["stars-block"]}>
                <span className={styles["stars"]}>&#9733;&#9733;&#9733;&#9733;&#9733;</span>
            </div>
          </div>
        );
    };     

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };
    
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if(inputValue === "") {
            return;
        }
        const comment = {
            name: props.userData.name,
            text: inputValue,
            date: new Date().toISOString()
        };
        const headerObject = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment)
        };
        fetch(url(`/api/products/add-comment/${productID.toString()}`), headerObject)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setProductData(prevData => {
                    return {
                        ...prevData,
                        comments: [
                            <div key={prevData.comments.length} className={styles["comment"]}>
                                <div style={{display: "flex", alignItems: "center", gap: "0.5rem"}}>
                                    <p className={styles["comment-name"]}>{comment.name}</p>
                                    <p className={styles["comment-date"]}>{formatDate(comment.date)}</p>
                                </div>
                                <p className={styles["comment-text"]}>{comment.text}</p>
                            </div>,
                            ...prevData.comments
                        ]
                    };
                });
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
                setErrorAddingComment(true);
                setTimeout(() => {
                    setErrorAddingComment(false);
                }, 3000);
            });
    };    
  
    return (
        <div id="product" className={styles["page-fade"]}>
            { productData &&
                <div className={styles["product-page"]}>
                    <Carousel 
                    containerClass={styles["product-images"]} 
                    responsive={responsive}
                    infinite={true}
                    showDots={true}
                    removeArrowOnDeviceType={["tablet", "mobile"]}>
                        { productData.images }
                    </Carousel>
                    <div className={styles["left-side-padding"]}/>
                    <div className={styles["right-product-info"]}>
                        {StarRating(productData.rating)}
                        <p className={styles["product-name"]}>{productData.name}</p>
                        <p className={styles["product-price"]}>${(productData.price / 100).toFixed(2)}</p>
                        <p className={styles["product-description"]} dangerouslySetInnerHTML={{__html: convertLinksToAnchors(productData.description)}}/>
                        <p className={styles["product-date-added"]}>Added: {productData["date-added"].slice(0, -4)}</p>
                        <div className={styles["tags-container"]}>
                            { productData.tags }
                        </div>
                        <div className={styles["product-options"]}>
                            <ColorSelector
                                id={productData.prod_id}
                                options={productData.colors}
                                availableColors={availableColors}
                                isLargeCard={false}
                                selectedColor={selectedColor}
                                setSelectedColor={setSelectedColor}
                            />
                            <button onClick={() => props.popProductAdded({ name: productData.name, image: productData.images[0], color: selectedColor })} className={styles["add-to-cart"]}>
                                <svg className={styles["add-to-cart-icon"]} xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" width="256" height="256" viewBox="0 0 256 256" xmlSpace="preserve">
                                    <defs/>
                                    <g transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)">
                                        <path d="M 72.975 58.994 H 31.855 c -1.539 0 -2.897 -1.005 -3.347 -2.477 L 15.199 13.006 H 3.5 c -1.933 0 -3.5 -1.567 -3.5 -3.5 s 1.567 -3.5 3.5 -3.5 h 14.289 c 1.539 0 2.897 1.005 3.347 2.476 l 13.309 43.512 h 36.204 l 10.585 -25.191 h -6.021 c -1.933 0 -3.5 -1.567 -3.5 -3.5 s 1.567 -3.5 3.5 -3.5 H 86.5 c 1.172 0 2.267 0.587 2.915 1.563 s 0.766 2.212 0.312 3.293 L 76.201 56.85 C 75.655 58.149 74.384 58.994 72.975 58.994 z" className={styles["add-to-cart-icon"]} />
                                        <circle cx="28.88" cy="74.33" r="6.16" className={styles["add-to-cart-icon"]} />
                                        <circle cx="74.59" cy="74.33" r="6.16" className={styles["add-to-cart-icon"]} />
                                        <path d="M 62.278 19.546 H 52.237 V 9.506 c 0 -1.933 -1.567 -3.5 -3.5 -3.5 s -3.5 1.567 -3.5 3.5 v 10.04 h -10.04 c -1.933 0 -3.5 1.567 -3.5 3.5 s 1.567 3.5 3.5 3.5 h 10.04 v 10.04 c 0 1.933 1.567 3.5 3.5 3.5 s 3.5 -1.567 3.5 -3.5 v -10.04 h 10.041 c 1.933 0 3.5 -1.567 3.5 -3.5 S 64.211 19.546 62.278 19.546 z" className={styles["add-to-cart-icon"]} />
                                    </g>
                                </svg>
                                <p style={{width: "45%"}}>Add to Cart</p>
                            </button>
                        </div>
                        <div className={styles["comments"]}>
                            <form onSubmit={handleSubmit} className={styles["add-comment"]}>
                                <input disabled={props.userData == undefined} onChange={handleInputChange} className={styles["comment-input-field"]} placeholder={props.userData != undefined ? "Add a comment..." : "You must be signed in to comment."}></input>
                                <button className={styles["submit"]} disabled={props.userData == undefined}>
                                    <svg className={styles["submit-icon"]} viewBox="0 0 256 256">
                                        <path d="M234.69409,219.61572a15.86649,15.86649,0,0,1-12.15625,5.69141,16.171,16.171,0,0,1-5.44531-.95117l-81.21094-29.00391V120a8,8,0,1,0-16,0v75.352L38.67065,224.356a16.00042,16.00042,0,0,1-19.3418-22.88575l94.5918-168.91455a16.00119,16.00119,0,0,1,27.92188,0l94.59179,168.915A15.87045,15.87045,0,0,1,234.69409,219.61572Z"/>
                                    </svg>
                                </button>
                            </form>
                            {
                                errorAddingComment ? <div>There was an error commenting</div> : ""
                            }
                            {
                                productData.comments
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    );
  };
  

export default ProductPage;