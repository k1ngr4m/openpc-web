import React, { useState, useEffect } from 'react';

const ProductSelector = ({ type, onSelect, onQuantityChange, selectedProduct }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [quantity, setQuantity] = useState(1);
    const [discountRate, setDiscountRate] = useState(0); // 折扣率状态（但不用于单个商品）
    const [isOpen, setIsOpen] = useState(false);

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

    // 模糊搜索函数
    const fuzzySearch = (text, term) => {
        if (!term) return true;
        
        const lowerText = text.toLowerCase();
        const lowerTerm = term.toLowerCase();
        
        // 将搜索词拆分为单个字符
        const termChars = lowerTerm.split('');
        let currentIndex = -1;
        
        // 检查文本中是否包含按顺序的所有字符（可以不连续）
        for (const char of termChars) {
            currentIndex = lowerText.indexOf(char, currentIndex + 1);
            if (currentIndex === -1) {
                return false;
            }
        }
        
        return true;
    };

    useEffect(() => {
        const filtered = products.filter(product =>
            fuzzySearch(product.sku_name, searchTerm)
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

    const handleQuantityChange = (e) => {
        const value = e.target.value;
        setQuantity(value);

        // 确保数量变化时更新总价
        if (selectedProduct) {
            onQuantityChange(type.id, value);
        }
    };


    const handleFocus = () => {
        setIsOpen(true);
        setSearchTerm('');
        fetchProducts();
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setIsOpen(true);
        
        if (!value) {
            onSelect(type.id, null);
        } else {
            const selected = products.find(p => p.sku_name === value);
            if (selected) {
                onSelect(type.id, selected, quantity);
            }
        }
    };

    const handleProductSelect = (product) => {
        setSearchTerm(product.sku_name);
        setIsOpen(false);
        onSelect(type.id, product, quantity);
    };

    const handleBlur = () => {
        // 延迟关闭下拉框，以便点击选项时不会立即关闭
        setTimeout(() => setIsOpen(false), 150);
    };

    return (
        <div className="product-selector">
            <div className="selector-row">
                <div className="product-name">{type.name}</div>
                <div className={`select-wrapper ${isOpen ? 'open' : ''}`}>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={selectedProduct ? selectedProduct.sku_name : `请选择${type.name}`}
                        className={`search-input ${loading ? 'loading' : ''}`}
                    />
                    <div className="search-icon">
                        <i className="fa fa-search"></i>
                    </div>
                    {isOpen && (
                        <div className="dropdown-list">
                            {loading && <div className="dropdown-item disabled">加载中...</div>}
                            {!loading && filteredProducts.map((product) => (
                                <div 
                                    key={product.sku_name} 
                                    className={`dropdown-item ${selectedProduct?.sku_name === product.sku_name ? 'selected' : ''}`}
                                    onClick={() => handleProductSelect(product)}
                                >
                                    {product.sku_name} - <span className="price">¥{product.price.toFixed(2)}</span>
                                </div>
                            ))}
                            {!loading && filteredProducts.length === 0 && searchTerm && (
                                <div className="dropdown-item disabled">无匹配结果</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 添加数量输入框 */}
            {selectedProduct && (
                <div className="details-wrapper">
                    <div className="details-row">
                        <div className="detail-item">
                            <span className="label">数量:</span>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={handleQuantityChange}
                                className="detail-input"
                            />
                        </div>
                        <div className="detail-item">
                            <span className="label">小计:</span>
                            <span className="price">¥{(selectedProduct.price * quantity).toFixed(2)}</span>
                        </div>
                        <div className="detail-item">
                            <button 
                                type="button" 
                                className="delete-button"
                                onClick={() => {
                                    setSearchTerm('');
                                    onSelect(type.id, null);
                                }}
                            >
                                删除
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                .product-selector {
                    margin-bottom: 15px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
                }
                
                .selector-row {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .product-name {
                    width: 100px;
                    font-weight: 600;
                    color: #333;
                    font-size: 15px;
                    flex-shrink: 0;
                }
                
                .select-wrapper {
                    flex: 1;
                    position: relative;
                    min-height: 42px;
                }
                
                .search-input {
                    width: 100%;
                    padding: 10px 40px 10px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    background-color: white;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                }
                
                .search-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .search-input.loading {
                    background-color: #f9fafb;
                }
                
                .search-icon {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: #9ca3af;
                    pointer-events: none;
                }
                
                .dropdown-list {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #d1d5db;
                    border-top: none;
                    border-radius: 0 0 6px 6px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                    max-height: 800px;
                    overflow-y: auto;
                    z-index: 100;
                    min-width: 100%;
                }
                
                .dropdown-item {
                    padding: 10px 12px;
                    cursor: pointer;
                    transition: background-color 0.1s ease;
                    border-bottom: 1px solid #f3f4f6;
                    font-size: 14px;
                    color: #374151;
                    white-space: normal;
                    word-break: break-word;
                    line-height: 1.4;
                    max-width: 100%;
                }
                
                .dropdown-item:last-child {
                    border-bottom: none;
                }
                
                .dropdown-item:hover {
                    background-color: #f3f4f6;
                }
                
                .dropdown-item.selected {
                    background-color: #dbeafe;
                    color: #1d4ed8;
                    font-weight: 500;
                }
                
                .dropdown-item.disabled {
                    cursor: default;
                    background-color: #f9fafb;
                    color: #9ca3af;
                    font-style: italic;
                }
                
                .details-wrapper {
                    margin-top: 12px;
                    padding: 12px;
                    background-color: #f8f9fa;
                    border-radius: 6px;
                }
                
                .details-row {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    justify-content: flex-end;
                }
                
                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .label {
                    font-size: 13px;
                    color: #374151;
                    font-weight: 500;
                }
                
                .detail-input {
                    width: 60px;
                    padding: 6px 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    font-size: 13px;
                    text-align: center;
                }
                
                .detail-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                .price {
                    color: #ef4444;
                    font-weight: 600;
                    min-width: 70px;
                    text-align: right;
                    font-size: 13px;
                }
                
                .percent {
                    font-size: 13px;
                    color: #374151;
                    font-weight: 500;
                }
                
                .delete-button {
                    padding: 6px 12px;
                    background-color: #f87171;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }
                
                .delete-button:hover {
                    background-color: #ef4444;
                }
            `}</style>
        </div>
    );
};

export default ProductSelector;