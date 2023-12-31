// LoginForm.js
import React, { useState } from 'react';
import { url } from './config/utils';

function LoginForm() {
  const [collection, setCollection] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const response = await fetch(url(`/api/products/${collection}/${quantity}`), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Collection:
        <input type="text" value={collection} onChange={(e) => setCollection(e.target.value)} />
      </label>
      <br />
      <label>
        Quantity:
        <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
      </label>
      <br />
      <button type="submit">Get Data</button>
    </form>
  );
}

export default LoginForm;