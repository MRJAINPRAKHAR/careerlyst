import { motion } from "framer-motion";

const PremiumLoader = () => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="relative flex flex-col items-center gap-6">
                {/* Spinner */}
                <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin" style={{ animationDuration: "1s" }} />
                    <div className="absolute inset-0 rounded-full border-r-2 border-purple-500 animate-spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
                    <div className="absolute inset-4 rounded-full border-l-2 border-pink-500 animate-spin" style={{ animationDuration: "2s" }} />
                </div>

                {/* Text */}
                <p className="text-slate-400 text-xs font-medium tracking-[0.2em] uppercase animate-pulse">
                    Loading Environment...
                </p>
            </div>
        </div>
    );
};

export default PremiumLoader;
