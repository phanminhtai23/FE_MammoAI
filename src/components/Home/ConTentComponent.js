import React, { useEffect, useRef } from "react";

const ContentComponent = ({ setActiveTab }) => {
    const observerRef = useRef();

    useEffect(() => {
        observerRef.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-fade-in');
                    }
                });
            },
            { threshold: 0.1 }
        );

        const animatedElements = document.querySelectorAll('.scroll-animate');
        animatedElements.forEach((el) => {
            observerRef.current.observe(el);
        });

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, []);

    return (
        <>
            {/* CSS cho animations */}
            <style jsx>{`
                .scroll-animate {
                    opacity: 0;
                    transform: translateY(50px);
                    transition: all 0.8s ease-out;
                }
                .animate-fade-in {
                    opacity: 1;
                    transform: translateY(0);
                }
                .floating {
                    animation: float 6s ease-in-out infinite;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
            `}</style>

            {/* Hero Section - Text ở góc trái */}
            <section className="min-h-screen flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex flex-col lg:flex-row items-center justify-between">
                        {/* Text content - bên trái */}
                        <div className="lg:w-1/2 text-left mb-12 lg:mb-0">
                            <h1 className="text-6xl lg:text-7xl font-extrabold text-white mb-8 leading-tight">
                                Tầm Soát<br/>
                                <span className="text-blue-300">Ung Thư Vú</span>
                            </h1>
                            <p className="text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed max-w-2xl">
                                Trả lời bảng câu hỏi để hỗ trợ tầm soát và đánh giá nguy cơ ung thư vú một cách 
                                nhanh chóng và chính xác
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-6">
                                <button
                                    onClick={() => setActiveTab('screening')}
                                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-10 py-5 rounded-2xl text-xl font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition duration-300 shadow-2xl"
                                >
                                    🔍 Bắt Đầu Tầm Soát
                                </button>
                                {/* <button
                                    onClick={() => (window.location.href = "/appointment")}
                                    className="bg-white/20 backdrop-blur-sm text-white border-2 border-white px-10 py-5 rounded-2xl text-xl font-semibold hover:bg-white/30 transform hover:scale-105 transition duration-300 shadow-2xl"
                                >
                                    📅 Đặt Lịch Khám
                                </button> */}
                            </div>
                        </div>

                        {/* Floating elements - bên phải */}
                        <div className="lg:w-1/2 flex justify-center relative">
                            <div className="floating">
                                <div className="relative">
                                    <div className="w-80 h-80 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl">
                                        <div className="w-60 h-60 bg-blue-500/20 rounded-full flex items-center justify-center">
                                            <svg className="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    {/* Floating particles */}
                                    <div className="absolute top-10 -right-4 w-6 h-6 bg-blue-300 rounded-full opacity-70 floating" style={{animationDelay: '1s'}}></div>
                                    <div className="absolute bottom-16 -left-8 w-4 h-4 bg-white rounded-full opacity-60 floating" style={{animationDelay: '2s'}}></div>
                                    <div className="absolute top-32 left-12 w-3 h-3 bg-blue-200 rounded-full opacity-80 floating" style={{animationDelay: '0.5s'}}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Nguy cơ ung thư section - giữ nguyên */}
            <section className="py-20 scroll-animate">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12">
                        <h2 className="text-4xl font-bold text-center text-blue-900 mb-12">
                            Mức Độ Nguy Cơ Ung Thư Vú
                        </h2>
                        <div className="grid md:grid-cols-3 gap-10">
                            <div className="text-center p-8 bg-green-50 rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition duration-500 scroll-animate">
                                <div className="bg-gradient-to-r from-green-400 to-green-500 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                                    <span className="text-white text-3xl font-bold">L</span>
                                </div>
                                <h3 className="text-2xl font-bold text-green-800 mb-4">Nguy Cơ Thấp</h3>
                                <p className="text-green-700 text-lg">Kết quả tầm soát cho thấy nguy cơ thấp. Tiếp tục theo dõi định kỳ.</p>
                            </div>
                            
                            <div className="text-center p-8 bg-yellow-50 rounded-2xl border-2 border-yellow-200 shadow-lg hover:shadow-xl transition duration-500 scroll-animate" style={{animationDelay: '0.2s'}}>
                                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                                    <span className="text-white text-3xl font-bold">M</span>
                                </div>
                                <h3 className="text-2xl font-bold text-yellow-800 mb-4">Nguy Cơ Trung Bình</h3>
                                <p className="text-yellow-700 text-lg">Cần theo dõi chặt chẽ và tham khảo ý kiến bác sĩ chuyên khoa.</p>
                            </div>
                            
                            <div className="text-center p-8 bg-red-50 rounded-2xl border-2 border-red-200 shadow-lg hover:shadow-xl transition duration-500 scroll-animate" style={{animationDelay: '0.4s'}}>
                                <div className="bg-gradient-to-r from-red-400 to-red-500 w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                                    <span className="text-white text-3xl font-bold">H</span>
                                </div>
                                <h3 className="text-2xl font-bold text-red-800 mb-4">Nguy Cơ Cao</h3>
                                <p className="text-red-700 text-lg">Nên đi khám ngay để được chẩn đoán và điều trị kịp thời.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Section - Mới */}
            <section className="py-20 scroll-animate">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-5xl font-bold text-white mb-8">
                                Tại sao nên tầm soát sớm?
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-start">
                                    <div className="bg-blue-500 rounded-full p-3 mr-4 mt-1">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Phát hiện sớm</h3>
                                        <p className="text-blue-100">Tỷ lệ khỏi bệnh lên đến 95% khi phát hiện ở giai đoạn sớm</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-blue-500 rounded-full p-3 mr-4 mt-1">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Điều trị hiệu quả</h3>
                                        <p className="text-blue-100">Phương pháp điều trị ít xâm lấn hơn khi phát hiện sớm</p>
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <div className="bg-blue-500 rounded-full p-3 mr-4 mt-1">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold text-white mb-2">Chi phí thấp</h3>
                                        <p className="text-blue-100">Tiết kiệm chi phí điều trị đáng kể khi phát hiện sớm</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white/15 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/20">
                                <div className="text-center">
                                    <div className="text-6xl mb-6">📊</div>
                                    <h3 className="text-2xl font-bold text-white mb-8">Thống Kê Quan Trọng Từ WHO năm 2022</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="bg-gradient-to-r from-blue-600/50 to-blue-700/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-300/50">
                                            <div className="text-4xl font-bold text-white mb-2">2,3 triệu</div>
                                            <div className="text-gray-100 text-lg font-semibold">Số ca mắc mới ung thư vú</div>
                                        </div>
                                        <div className="bg-gradient-to-r from-green-600/50 to-green-700/50 backdrop-blur-sm rounded-2xl p-6 border border-green-300/50">
                                            <div className="text-4xl font-bold text-white mb-2">670.000</div>
                                            <div className="text-gray-100 text-lg font-semibold">Số bệnh nhân tử vong</div>
                                        </div>
                                        <div className="bg-gradient-to-r from-purple-600/50 to-purple-700/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-300/50">
                                            <div className="text-4xl font-bold text-white mb-2">#1</div>
                                            <div className="text-gray-100 text-lg font-semibold">Loại ung thư phổ biến nhất ở phụ nữ</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Thống kê tử vong WHO - Thay thế phần Quy trình tầm soát */}
            <section className="py-20 scroll-animate">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-r from-red-900/80 to-red-800/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-red-500/30">
                        <div className="text-center mb-12">
                            <h2 className="text-5xl font-bold text-white mb-6">Thống Kê Tử Vong Từ WHO</h2>
                            <p className="text-xl text-red-100 max-w-4xl mx-auto leading-relaxed">
                                Theo thống kê mới nhất từ <strong>Tổ chức Y tế Thế giới (WHO) năm 2022</strong>, 
                                ung thư vú vẫn là mối đe dọa nghiêm trọng đối với sức khỏe phụ nữ toàn cầu
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="text-center scroll-animate">
                                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
                                    <div className="text-8xl font-bold text-red-300 mb-4">2.3M</div>
                                    <div className="text-2xl font-bold text-white mb-3">CA MẮC MỚI</div>
                                    <p className="text-red-100 text-lg">
                                        2,3 triệu ca ung thư vú mới được ghi nhận trên toàn thế giới
                                    </p>
                                    <div className="mt-6 bg-red-500/20 rounded-xl p-4">
                                        <div className="text-3xl font-bold text-red-200">≈ 6.300</div>
                                        <div className="text-red-100">ca mắc mới mỗi ngày</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center scroll-animate" style={{animationDelay: '0.3s'}}>
                                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 shadow-xl border border-white/20">
                                    <div className="text-8xl font-bold text-red-300 mb-4">670K</div>
                                    <div className="text-2xl font-bold text-white mb-3">TỬ VONG</div>
                                    <p className="text-red-100 text-lg">
                                        670.000 người tử vong vì ung thư vú trong năm 2022
                                    </p>
                                    <div className="mt-6 bg-red-500/20 rounded-xl p-4">
                                        <div className="text-3xl font-bold text-red-200">≈ 1.836</div>
                                        <div className="text-red-100">ca tử vong mỗi ngày</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-12 scroll-animate" style={{animationDelay: '0.6s'}}>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
                                <h3 className="text-2xl font-bold text-white mb-4">Tỷ lệ tử vong</h3>
                                <div className="text-5xl font-bold text-red-300 mb-2">29%</div>
                                <p className="text-red-100 text-lg">
                                    Gần 1 trong 3 ca mắc ung thư vú dẫn đến tử vong
                                </p>
                                <div className="mt-6 text-yellow-200 font-semibold text-xl">
                                    ⚠️ Phát hiện sớm có thể cứu sống hàng triệu người
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Cải tiến */}
            <section className="py-20 scroll-animate">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-16 shadow-2xl">
                        <h2 className="text-4xl font-bold text-white mb-6">
                            Đừng để quá muộn
                        </h2>
                        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                            Hãy bắt đầu tầm soát ngay hôm nay để bảo vệ sức khỏe của bạn và những người thân yêu
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <button
                                onClick={() => setActiveTab('screening')}
                                className="bg-white text-blue-600 px-12 py-5 rounded-2xl text-xl font-bold hover:bg-gray-100 transform hover:scale-105 transition duration-300 shadow-xl"
                            >
                                Bắt Đầu Tầm Soát Ngay
                            </button>
                            <button
                                onClick={() => (window.location.href = "/register")}
                                className="border-3 border-white text-white px-12 py-5 rounded-2xl text-xl font-bold hover:bg-white hover:text-blue-600 transform hover:scale-105 transition duration-300"
                            >
                                Đăng Ký (Bác Sĩ)
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer - Cải tiến */}
            <footer className="bg-blue-900/95 backdrop-blur-sm text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div className="md:col-span-2">
                            <div className="flex items-center mb-6">
                                <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-full p-3 mr-3">
                                    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <span className="text-2xl font-bold">MammoAI</span>
                            </div>
                            <p className="text-blue-200 text-lg mb-6 max-w-md">
                                Hệ thống hỗ trợ tầm soát ung thư vú, giúp phát hiện sớm và điều trị kịp thời. 
                                Vì sức khỏe là tài sản quý giá nhất.
                            </p>
                            <div className="flex space-x-4">
                                {/* <div className="bg-blue-800 p-3 rounded-full hover:bg-blue-700 transition duration-300 cursor-pointer">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                    </svg>
                                </div> */}
                                {/* <div className="bg-blue-800 p-3 rounded-full hover:bg-blue-700 transition duration-300 cursor-pointer">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                                    </svg>
                                </div> */}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-6">Liên Kết</h4>
                            <ul className="space-y-3">
                                <li><button onClick={() => setActiveTab('home')} className="text-blue-200 hover:text-white transition duration-300 text-lg">Trang chủ</button></li>
                                <li><button onClick={() => setActiveTab('screening')} className="text-blue-200 hover:text-white transition duration-300 text-lg">Tầm soát ung thư</button></li>
                                <li><a href="/login" className="text-blue-200 hover:text-white transition duration-300 text-lg">Đăng nhập (Bác sĩ)</a></li>
                                <li><a href="/register" className="text-blue-200 hover:text-white transition duration-300 text-lg">Đăng ký (Bác sĩ)</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-6">Liên Hệ</h4>
                            <div className="space-y-3 text-blue-200 text-lg">
                                <p>📧 info@mammoai.com</p>
                                <p>📞 12345678910</p>
                                <p>📍 Cần Thơ, Việt Nam</p>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-blue-800 mt-12 pt-8 text-center">
                        <p className="text-blue-300 text-lg">&copy; 2025 MammoAI. Tất cả quyền được bảo lưu.</p>
                    </div>
                </div>
            </footer>
        </>
    );
};

export default ContentComponent;
