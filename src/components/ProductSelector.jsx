import React, { useState, useEffect } from 'react';

const ProductSelector = ({ type, onSelect, onQuantityChange, selectedProduct }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://127.0.0.1:8090/v1/getProductList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type: type.apiType })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            setProducts(data || []);
            setFilteredProducts(data || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const filtered = products.filter(product =>
            product.sku_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(filtered);
    }, [searchTerm, products]);

    // 当选择的产品变化时，重置数量为1
    useEffect(() => {
        if (selectedProduct) {
            setQuantity(selectedProduct.quantity || 1);
        } else {
            setQuantity(1);
        }
    }, [selectedProduct]);

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (!value) {
            onSelect(type.id, null);
            return;
        }

        const selected = products.find(p => p.sku_name === value);
        if (selected) {
            onSelect(type.id, selected, quantity);
        }
    };

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        setQuantity(value);

        // 确保数量变化时更新总价
        if (selectedProduct) {
            onQuantityChange(type.id, value);
        }
    };

    const handleFocus = () => {
        setSearchTerm('');
        fetchProducts();
    };

    return (
        <div className="product-selector">
            <div className="product-name">{type.name}</div>
            <div className="select-wrapper">
                <select
                    value={selectedProduct?.sku_name || ''}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className={loading ? 'loading' : ''}
                >
                    {loading && <option value="" disabled>加载中...</option>}
                    {!loading && !searchTerm && <option value="">请选择{type.name}</option>}
                    {filteredProducts.map(product => (
                        <option key={product.sku_name} value={product.sku_name}>
                            {product.sku_name} - ¥{product.price.toFixed(2)}
                        </option>
                    ))}
                    {!loading && filteredProducts.length === 0 && (
                        <option value="" disabled>无匹配结果</option>
                    )}
                </select>
                <div className="search-icon">
                    <i className="fa fa-search"></i>
                </div>
            </div>

            {/* 添加数量输入框 */}
            {selectedProduct && (
                <div className="quantity-wrapper">
                    <span className="label">数量:</span>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="quantity-input"
                    />
                    <span className="subtotal">小计: ¥{(selectedProduct.price * quantity).toFixed(2)}</span>
                </div>
            )}
        </div>
    );
};

export default ProductSelector;