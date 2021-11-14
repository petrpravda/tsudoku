import React, {ReactElement, useCallback, useEffect} from "react";

const ModalDialog: React.FC<{footer: ReactElement, show: boolean, onClose: () => void}> = ({ children, footer,
        show, onClose}) => {
    const onCloseListener = useCallback((e: KeyboardEvent) => {
        if (show && e.key === 'Escape' && onClose !== undefined) {
            onClose();
        }
    }, [onClose, show]);

    useEffect(() => {
        window.addEventListener("keydown", onCloseListener);
        return () => {
            window.removeEventListener("keydown", onCloseListener);
        };
    }, [onCloseListener]);

    return (
        <div className={`modal${show ? ' is-active' : ''}`}>
            {/*tabIndex="-1"*/}
            <div className="modal-background"></div>
            <div className="animation-content" style={{maxWidth: "960px"}}>
                <form action="" can-cancel="escape,x,outside,button">
                    <div className="modal-card" style={{width: "auto"}}>
                        <header className="modal-card-head"><p className="modal-card-title">New
                            Game</p>
                            <button type="button" className="delete" onClick={onClose}>delete</button>
                        </header>
                        <section className="modal-card-body">
                            {children}
                        </section>
                        <footer className="modal-card-foot">
                            {footer}
                        </footer>
                    </div>
                </form>
            </div>
        </div>
    )
}

    export default ModalDialog;
