import React from 'react';
import styles from './css/colorselector.module.css';
import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
    options: string[];
}

const ColorSelector = (props: DropdownProps) => {

    const [selectedColor, setSelectedColor] = useState(props.options[0]);
    const [isOpen, setIsOpen] = useState(false);
    const toggleButtonRef = useRef<HTMLButtonElement | null>(null);

    const handleOptionClick = (option: string) => {
        setSelectedColor(option);
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

    return (
        <div className={styles["color-selector"]}>
            <button onClick={handleToggleClick} ref={toggleButtonRef} className={styles["dropdown-toggle"]}><div style={{backgroundImage : `url("./colors/${selectedColor.toLowerCase()}.png")`, backgroundSize: "cover"}} className={styles["color-preview"]}/>{selectedColor}
            {
                isOpen ? <div style={{position: "absolute", right: "0.35em", top: "0.55em"}}>⌃</div> : <div style={{position: "absolute", right: "0.35em", top: "0.15em"}}>⌄</div>
            }
            </button>
            {isOpen &&
                <ul className={styles["dropdown-menu"]}>
                    {props.options.map((option, index) => (
                        <li style={{display: "flex"}} onClick={() => handleOptionClick(option)} key={index}><div style={{backgroundImage : `url("./colors/${option.toLowerCase()}.png")`, backgroundSize: "cover", boxShadow : option.toLowerCase() == "glow" ? "0 0 5px 3px rgba(0, 123, 155, 1)" : ""}} className={styles["color-preview"]}/>{option}</li>
                    ))}
                </ul>
            }
        </div>
    );
};

export default ColorSelector;
