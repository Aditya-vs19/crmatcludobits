import { useState, useEffect, useRef } from 'react';

/**
 * SmartDropdown - A dropdown that pulls from DB and allows manual override
 * @param {Array} options - Array of existing options from database
 * @param {String} value - Current value
 * @param {Function} onChange - Callback when value changes
 * @param {String} placeholder - Placeholder text
 * @param {Boolean} allowCustom - Allow custom/manual entry
 * @param {String} customLabel - Label for "Add New" option
 */
const SmartDropdown = ({
    options = [],
    value,
    onChange,
    placeholder = 'Select or type...',
    allowCustom = true,
    customLabel = '+ Add New',
    disabled = false,
}) => {
    const [isCustomMode, setIsCustomMode] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    // Check if current value is custom (not in options)
    useEffect(() => {
        if (value && !options.includes(value)) {
            setIsCustomMode(true);
            setSearchTerm(value);
        } else {
            setSearchTerm('');
        }
    }, [value, options]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectOption = (option) => {
        if (option === '__custom__') {
            setIsCustomMode(true);
            setShowDropdown(false);
            onChange('');
        } else {
            setIsCustomMode(false);
            setSearchTerm('');
            onChange(option);
            setShowDropdown(false);
        }
    };

    const handleCustomInput = (e) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        onChange(newValue);
    };

    const handleInputClick = () => {
        if (!isCustomMode) {
            setShowDropdown(!showDropdown);
        }
    };

    const handleBackToDropdown = () => {
        setIsCustomMode(false);
        setSearchTerm('');
        onChange('');
        setShowDropdown(true);
    };

    return (
        <div className="smart-dropdown" ref={dropdownRef}>
            <div className="smart-dropdown-input-wrapper">
                {isCustomMode ? (
                    <div className="custom-input-container">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleCustomInput}
                            placeholder={placeholder}
                            className="input smart-dropdown-custom-input"
                            disabled={disabled}
                        />
                        {allowCustom && (
                            <button
                                type="button"
                                onClick={handleBackToDropdown}
                                className="btn-back-to-dropdown"
                                title="Back to dropdown"
                                disabled={disabled}
                            >
                                ↩
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="dropdown-select-container">
                        <button
                            type="button"
                            onClick={handleInputClick}
                            className="smart-dropdown-button"
                            disabled={disabled}
                        >
                            <span className={value ? '' : 'placeholder'}>
                                {value || placeholder}
                            </span>
                            <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
                        </button>
                    </div>
                )}
            </div>

            {showDropdown && !isCustomMode && (
                <div className="smart-dropdown-menu">
                    {filteredOptions.length > 0 ? (
                        <>
                            {filteredOptions.map((option, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelectOption(option)}
                                    className="dropdown-option"
                                >
                                    {option}
                                </button>
                            ))}
                        </>
                    ) : (
                        <div className="dropdown-empty">No options found</div>
                    )}

                    {allowCustom && (
                        <>
                            <div className="dropdown-divider"></div>
                            <button
                                type="button"
                                onClick={() => handleSelectOption('__custom__')}
                                className="dropdown-option custom-option"
                            >
                                {customLabel}
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SmartDropdown;
