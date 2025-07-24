import React, { useState, useEffect } from 'react';
import ProductSelector from './components/ProductSelector';
import './App.css';

const App = () => {
    const productTypes = [
        { id: '1', name: 'CPU', apiType: '2' },
        { id: '2', name: '主板', apiType: '3' },
        { id: '3', name: '散热器', apiType: '4' },
        { id: '4', name: '显卡', apiType: '1' },
        { id: '5', name: '内存', apiType: '5' },
        { id: '6', name: '固态硬盘', apiType: '6' },
        { id: '7', name: '电源', apiType: '7' },
        { id: '8', name: '机箱', apiType: '8' },
        { id: '9', name: '风扇', apiType: '9' }
    ];

    // 修改selectedProducts状态结构，增加quantity字段
    const [selectedProducts, setSelectedProducts] = useState({});
    const [totalPrice, setTotalPrice] = useState(0);
    const [discountRate, setDiscountRate] = useState(0); // 添加总体折扣率状态

    // 更新产品选择处理函数
    const handleProductSelect = (typeId, product, quantity = 1) => {
        setSelectedProducts(prev => ({
            ...prev,
            [typeId]: {
                ...product,
                quantity: quantity
            }
        }));
    };

    // 更新数量处理函数
    const handleQuantityChange = (typeId, quantity) => {
        if (selectedProducts[typeId]) {
            setSelectedProducts(prev => ({
                ...prev,
                [typeId]: {
                    ...prev[typeId],
                    quantity: parseInt(quantity) || 0
                }
            }));
        }
    };

    // 计算总价时考虑数量和折扣率因素
    useEffect(() => {
        const sum = Object.values(selectedProducts)
            .reduce((acc, product) => acc + (product?.price || 0) * (product?.quantity || 0), 0);
        const discountedPrice = sum * (1 - discountRate / 100);
        setTotalPrice(discountedPrice);
    }, [selectedProducts, discountRate]);

    // 添加折扣率变化处理函数
    const handleDiscountChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setDiscountRate(Math.min(Math.max(value, 0), 100)); // 限制在0-100之间
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>DIY装机配置</h1>
            </header>
            <main className="app-main">
                <div className="product-list">
                    {productTypes.map(type => (
                        <ProductSelector
                            key={type.id}
                            type={type}
                            onSelect={handleProductSelect}
                            onQuantityChange={handleQuantityChange}
                            selectedProduct={selectedProducts[type.id]}
                        />
                    ))}
                </div>
                <div className="summary">
                    <div className="discount-row">
                        <span className="label">总体折扣率:</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={discountRate}
                            onChange={handleDiscountChange}
                            className="discount-input"
                        />
                        <span className="percent">%</span>
                    </div>
                    <div className="total-price">
                        <span className="label">总价:</span>
                        <span className="price">¥{totalPrice.toFixed(2)}</span>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;