import Carousel from 'react-multi-carousel';
import { url } from './config/utils';
import styles from './css/collectionsmodal.module.css';
import { useState, useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import AvailableColor from './utils/availablecolors';
import LoadingSpinner from './LoadingSpinner';

interface ProductCardProps {
    id: string;
    name: string;
    image: string;
    price: number;
    rating: number;
    colorOptions: string[]
    availableColors: AvailableColor[];
    redirect: string;
    largeCard: boolean;
    popProductAdded(data: {name: string, image: string, color: string}): void;
};

interface CollectionsModalProps {
    popProductAdded(data: {name: string, image: string, color: string}): void;
}

function CollectionsModal(props: CollectionsModalProps) {

    const [selectedCollection, setSelectedCollection] = useState('');
    const [collections, setCollections] = useState([]);
    const [collectionCards, setCollectionCards] = useState({});
    const [cardIDs, setCardIDs] = useState({});
    const [isOpen, setIsOpen] = useState(false);
    const [ran, setRan] = useState(false);
    const [availableColors, setAvailableColors] = useState<AvailableColor[]>();
    const [loading, setLoading] = useState(true);
    const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
    
    const handleOptionClick = (option: string) => {
        setSelectedCollection(option);
        setIsOpen(false);
    };

    const handleToggleClick = () => {
        setIsOpen(!isOpen);
    };

    const handleDocumentClick = (e: MouseEvent) => {
        if (
          toggleButtonRef.current &&
          !toggleButtonRef.current.contains(e.target as Node)
        ) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
          document.addEventListener('click', handleDocumentClick);
        } else {
          document.removeEventListener('click', handleDocumentClick);
        }
    
        return () => {
          document.removeEventListener('click', handleDocumentClick);
        };
    }, [isOpen]);

    useEffect(() => {
        async function loadCollections() {
            if(ran) return;
            setRan(true);
            const responseHeader =  {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            const colorResponse = await fetch(url("/api/misc-data/available-colors"), responseHeader);
            const colorData = await colorResponse.json();
            const currentAvailableColors: AvailableColor[] = Object.entries(colorData).map(([color, availability]) => ({
                color: color as string,
                available: availability as boolean
            }));
            const collectionsResponse = await fetch(url("/api/products/get-collections"), responseHeader);
            const collections: string[] = await collectionsResponse.json();

            let allCollections = {};
            let collectionCardIDs = {}
            for (let i = 0; i < collections.length; i++) {
                const productsResponse = await fetch(url(`/api/products/${collections[i]}/6`), responseHeader);
                const products = await productsResponse.json();
                let mappedProductCards = products.map((product: {prod_id: string, name: string, images: string[], price: number, rating: number, redirect: string, colors: string[]}) => {
                    let collection = []
                    if(collections[i] in collectionCardIDs) {
                        collection = collectionCardIDs[collections[i]];
                        collection.push(product.prod_id);
                    }
                    else {
                        collection = [product.prod_id];
                    }
                    collectionCardIDs[collections[i]] = collection;
                
                    return <ProductCard 
                            key={product.prod_id}
                            id={product.prod_id}
                            name={product.name} 
                            image={product.images[0]} 
                            price={product.price} 
                            rating={product.rating} 
                            colorOptions={product.colors}
                            availableColors={currentAvailableColors}
                            redirect={"/"}
                            largeCard={false}
                            popProductAdded={props.popProductAdded}/>
                });
                allCollections[collections[i]] = mappedProductCards;
            }
            setCollections(collections);
            setSelectedCollection(collections[0]);
            setCardIDs(collectionCardIDs);
            setAvailableColors(currentAvailableColors);
            setLoading(false);
            setCollectionCards(prevState => {
                return { ...prevState, ...allCollections };
            });
        }
        Object.keys(collectionCards).length === 0 ? loadCollections() : "";
    })

    function loadMoreProducts() {
        async function loadMoreFromCollection() {
            setLoading(true);
            const responseHeader =  {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cardIDs[selectedCollection])
            }
            const productsResponse = await fetch(url(`/api/products/get-products-not/${selectedCollection}/6`), responseHeader);
            const products = await productsResponse.json();
            let newCollectionCardIDs = { ...cardIDs };
            let newAllCollections = { ...collectionCards };
            let mappedProductCards = products.map((product: {prod_id: string, name: string, images: string[], price: number, rating: number, redirect: string, colors: string[]}) => {
                let collection = []
                collection = newCollectionCardIDs[selectedCollection];
                collection.push(product.prod_id);
                newCollectionCardIDs[selectedCollection] = collection;
            
                return <ProductCard 
                        key={product.prod_id}
                        id={product.prod_id}
                        name={product.name} 
                        image={product.images[0]} 
                        price={product.price} 
                        rating={product.rating} 
                        colorOptions={product.colors}
                        availableColors={availableColors}
                        redirect={"/"}
                        largeCard={false}
                        popProductAdded={props.popProductAdded}/>
            });
            for(let i = 0; i < mappedProductCards.length; i++) {
                newAllCollections[selectedCollection] = [
                    ...newAllCollections[selectedCollection],
                    ...mappedProductCards
                ];
            }
            setCardIDs(newCollectionCardIDs);
            setCollectionCards(newAllCollections);
            setLoading(false);
        }
        loadMoreFromCollection();
    }

    return (
        <div className={styles["collections-modal"]}>
            <fieldset className={styles["collections-field"]}>
                <legend className={styles["collections-legend"]}>
                    <div style={{display: "flex", gap: "0.5rem"}}>
                        <p>Sort by Collection</p>
                        <div style={{display: 'relative'}}>
                            <button onClick={handleToggleClick} ref={toggleButtonRef} className={styles["dropdown-toggle"]}> {selectedCollection.charAt(0).toUpperCase() + selectedCollection.slice(1)}
                                {
                                    isOpen ? <div style={{position: "absolute", right: "0.35em", top: "0.55em"}}>⌃</div> : <div style={{position: "absolute", right: "0.35em", top: "0.15em"}}>⌄</div>
                                }
                            </button>
                            {isOpen &&
                                <ul className={styles["dropdown-menu"]}>
                                    {collections.map((option, index) => (
                                        <li onClick={() => handleOptionClick(option)} key={index}>
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </li>
                                    ))}
                                </ul>
                            }
                        </div>
                    </div>
                </legend>
                <div className={styles["collection-display"]}>{ collectionCards[selectedCollection] }</div>
                <div style={{width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '0 0 0.75rem 0'}}>
                    {
                        loading && <LoadingSpinner
                            color={"#102542"}
                            solid={false}/>
                    }
                    <button onClick={loadMoreProducts} className={styles["load-more"]}>Load More</button>
                </div>
            </fieldset>
        </div>
    );
}

export default CollectionsModal;