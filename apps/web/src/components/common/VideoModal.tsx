import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './VideoModal.css';

interface VideoModalProps {
    videoUrl: string;
    onClose: () => void;
    title?: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoUrl, onClose, title }) => {
    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="video-modal-overlay" onClick={onClose}>
            <div className="video-modal-container" onClick={e => e.stopPropagation()}>
                <div className="video-modal-header">
                    <h3>{title || 'Video Player'}</h3>
                    <button className="video-close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="video-modal-content">
                    <iframe
                        src={`${videoUrl}?autoplay=1`}
                        title={title || 'Video'}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
