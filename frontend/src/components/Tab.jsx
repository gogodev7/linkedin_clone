import React from 'react';

// Small accessible Tab component. Uses forwardRef so parent can manage focus.
const Tab = React.forwardRef(({ id, selected, onClick, children, className, ...props }, ref) => {
    return (
        <a
            id={id}
            ref={ref}
            role="tab"
            aria-selected={selected}
            tabIndex={0}
            onClick={onClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClick && onClick(e);
                }
            }}
            className={`py-3 border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 ${className || ''}`}
            {...props}
        >
            {children}
        </a>
    );
});

Tab.displayName = 'Tab';

export default Tab;
