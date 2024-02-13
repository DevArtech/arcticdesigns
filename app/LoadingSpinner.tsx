import styles from './css/loadingspinner.module.css';

interface LoadingSpinnerProps {
    color: string;
    solid?: boolean;
    noBottomPadding?: boolean;
}

function LoadingSpinner(props: LoadingSpinnerProps) {
    return (
        <div style={{
            border: `1px solid ${props.color}`, 
            background: props.solid ? props.color : "",
            color: props.color,
            marginBottom: !props.noBottomPadding ? "1rem" : "0"
        }} className={styles["loader"]}/>
    );
}

export default LoadingSpinner;