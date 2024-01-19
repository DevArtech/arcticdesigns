import styles from './css/loadingspinner.module.css';

interface LoadingSpinnerProps {
    color: string;
    solid?: boolean;
}

function LoadingSpinner(props: LoadingSpinnerProps) {
    return (
        <div style={{
            border: `1px solid ${props.color}`, 
            background: props.solid ? props.color : "",
            color: props.color
        }} className={styles["loader"]}/>
    );
}

export default LoadingSpinner;