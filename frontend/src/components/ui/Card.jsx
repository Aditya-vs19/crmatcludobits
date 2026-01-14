import './Card.css';

const Card = ({
    title,
    subtitle,
    children,
    headerAction,
    footer,
    className = ''
}) => {
    return (
        <div className={`card-component ${className}`}>
            {(title || subtitle || headerAction) && (
                <div className="card-header">
                    <div className="card-header-content">
                        {title && <h3 className="card-title">{title}</h3>}
                        {subtitle && <p className="card-subtitle">{subtitle}</p>}
                    </div>
                    {headerAction && <div className="card-header-action">{headerAction}</div>}
                </div>
            )}

            <div className="card-body">
                {children}
            </div>

            {footer && (
                <div className="card-footer">
                    {footer}
                </div>
            )}
        </div>
    );
};

export default Card;
