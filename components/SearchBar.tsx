'use client';

import { useState, useEffect } from 'react';
import { IProduct } from '@/models/Product';

interface SearchBarProps {
    products: IProduct[];
    onFilterChange: (filtered: IProduct[]) => void;
}

export default function SearchBar({ products, onFilterChange }: SearchBarProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);

    const platforms = ['all', 'Prime Video', 'Spotify', 'YouTube Premium', 'JioHotstar', 'JioSaavn', 'SonyLIV'];

    useEffect(() => {
        filterProducts();
    }, [searchTerm, selectedPlatform, priceRange, products]);

    const filterProducts = () => {
        let filtered = [...products];

        // Search by name/platform
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.platform.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by platform
        if (selectedPlatform !== 'all') {
            filtered = filtered.filter(p => p.platform === selectedPlatform);
        }

        // Filter by price range
        filtered = filtered.filter(p => {
            const minPrice = Math.min(...p.durations.map(d => d.price));
            return minPrice >= priceRange[0] && minPrice <= priceRange[1];
        });

        onFilterChange(filtered);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedPlatform('all');
        setPriceRange([0, 5000]);
    };

    const hasFilters = searchTerm || selectedPlatform !== 'all' || priceRange[0] > 0 || priceRange[1] < 5000;

    return (
        <div className="search-bar-container">
            {/* Main Search Input */}
            <div className="search-input-wrapper">
                <div className="search-icon">🔍</div>
                <input
                    type="text"
                    placeholder="Search products or platforms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                {searchTerm && (
                    <button
                        className="clear-search-btn"
                        onClick={() => setSearchTerm('')}
                        aria-label="Clear search"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Platform Filters */}
            <div className="filter-chips">
                {platforms.map(platform => (
                    <button
                        key={platform}
                        onClick={() => setSelectedPlatform(platform)}
                        className={`filter-chip ${selectedPlatform === platform ? 'active' : ''}`}
                    >
                        {platform === 'all' ? 'All Platforms' : platform}
                    </button>
                ))}
            </div>

            {/* Price Range */}
            <div className="price-filter">
                <label className="price-label">
                    Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
                </label>
                <div className="price-inputs">
                    <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                        className="price-input"
                        placeholder="Min"
                    />
                    <span>to</span>
                    <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                        className="price-input"
                        placeholder="Max"
                    />
                </div>
            </div>

            {/* Clear Filters */}
            {hasFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                    <span>Clear All Filters</span>
                    <span className="clear-icon">↻</span>
                </button>
            )}
        </div>
    );
}
