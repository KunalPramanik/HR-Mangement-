'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Category = 'All' | 'Payroll' | 'Leave' | 'IT Support' | 'General' | 'Policy';

interface FAQItem {
    question: string;
    answer: string;
    category: Category;
}

const FAQS: FAQItem[] = [
    // Payroll
    {
        question: "How do I download my payslip?",
        answer: "You can download your payslip by navigating to the 'Payslips' section from your Dashboard. Select the month you need and click the 'Download PDF' button.",
        category: 'Payroll'
    },
    {
        question: "When is the salary credited?",
        answer: "Salaries are processed on the last working day of every month. It may take 1-2 business days to reflect in your bank account depending on your bank.",
        category: 'Payroll'
    },
    {
        question: "How is my tax (TDS) calculated?",
        answer: "TDS is calculated based on your projected annual income and the tax regime you have selected. You can view your tax breakdown in the 'Tax' section of your profile or payslip.",
        category: 'Payroll'
    },
    {
        question: "Who do I contact for salary discrepancies?",
        answer: "For any discrepancies in your salary or reimbursement, please raise a ticket to the Finance team via 'finance@mindstar.com' or use the Help Desk form below.",
        category: 'Payroll'
    },

    // Leave
    {
        question: "How do I apply for leave?",
        answer: "Go to the Dashboard and click on 'Request Leave' or 'Quick Actions > Request Leave'. Fill in the dates, leave type, and reason, then submit for approval.",
        category: 'Leave'
    },
    {
        question: "What happens if I exhaust my leave balance?",
        answer: "If you have exhausted your paid leave balance, any additional leave will be treated as 'Loss of Pay' (LOP), subject to manager approval.",
        category: 'Leave'
    },
    {
        question: "Can I cancel a leave request?",
        answer: "Yes, you can cancel a pending leave request from the 'My Requests' section. If the leave is already approved, you must request a cancellation which requires manager approval.",
        category: 'Leave'
    },
    {
        question: "What is the policy for sick leave?",
        answer: "Employees are entitled to 10 days of sick leave per year. Medical certificates are required for sick leaves extending beyond 3 consecutive days.",
        category: 'Leave'
    },

    // IT Support
    {
        question: "How do I reset my portal password?",
        answer: "If you are logged in, go to 'Profile > Security' to change your password. If you cannot log in, click 'Forgot Password' on the login screen or contact IT Admin.",
        category: 'IT Support'
    },
    {
        question: "How do I request a new software installation?",
        answer: "Software requests must be approved by your manager. Once approved, submit an IT Ticket with the software name and business justification.",
        category: 'IT Support'
    },
    {
        question: "My VPN is not connecting. What should I do?",
        answer: "Please ensure your internet connection is stable. Try restarting the VPN client. If the issue persists, contact the IT Helpdesk at 'it-support@mindstar.com'.",
        category: 'IT Support'
    },
    {
        question: "How do I configure my work email on my phone?",
        answer: "You can download Outlook for Mobile and sign in using your company credentials. Multi-factor authentication (MFA) may be required.",
        category: 'IT Support'
    },

    // General / Policy
    {
        question: "What are the official office timings?",
        answer: "General shift timings are 9:30 AM to 6:30 PM, Monday to Friday. Flexible timing options may be available depending on your role and manager approval.",
        category: 'General'
    },
    {
        question: "What is the dress code policy?",
        answer: "We follow a 'Business Casual' dress code from Monday to Thursday. Fridays are casual dress days, provided the attire is appropriate for a workplace.",
        category: 'General'
    },
    {
        question: "How do I claim expenses?",
        answer: "Expense claims can be submitted via the 'Expenses' module. Upload your receipts and submit for approval. Claims are processed weekly.",
        category: 'Policy'
    }
];

export default function HelpSupportPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Filter Logic
    const filteredFAQs = FAQS.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const categories: Category[] = ['All', 'Payroll', 'Leave', 'IT Support', 'General', 'Policy'];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 pb-20">
            {/* Header */}
            <div className="max-w-4xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.back()}
                        className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-700 dark:text-slate-200">arrow_back</span>
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Help & Support</h1>
                </div>

                <div className="text-center py-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">How can we help you?</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">Search our knowledge base or browse by category below.</p>

                    <div className="relative max-w-xl mx-auto">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            type="text"
                            placeholder="Search for answers (e.g. 'Payslip', 'Leave', 'Password')..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#135bec] transition-shadow"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Categories */}
                <div className="flex flex-wrap gap-2 justify-center mb-10">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setSelectedCategory(cat); setOpenIndex(null); }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${selectedCategory === cat
                                    ? 'bg-[#135bec] text-white shadow-md transform scale-105'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFAQs.length > 0 ? (
                        filteredFAQs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden transition-all hover:shadow-md"
                            >
                                <button
                                    onClick={() => toggleAccordion(index)}
                                    className="w-full flex items-center justify-between p-5 text-left"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-lg shrink-0 ${faq.category === 'Payroll' ? 'bg-green-100 text-green-600' :
                                                faq.category === 'Leave' ? 'bg-orange-100 text-orange-600' :
                                                    faq.category === 'IT Support' ? 'bg-blue-100 text-blue-600' :
                                                        'bg-slate-100 text-slate-600'
                                            }`}>
                                            <span className="material-symbols-outlined text-[20px]">
                                                {faq.category === 'Payroll' ? 'attach_money' :
                                                    faq.category === 'Leave' ? 'flight_takeoff' :
                                                        faq.category === 'IT Support' ? 'computer' : 'help'}
                                            </span>
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-white text-base md:text-lg">{faq.question}</span>
                                    </div>
                                    <span className={`material-symbols-outlined text-slate-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                        expand_more
                                    </span>
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-5 pt-0 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 mt-2">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                            <p className="text-slate-500">No results found for "{searchTerm}".</p>
                        </div>
                    )}
                </div>

                {/* Contact Support */}
                <div className="mt-16 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-8 text-center text-white shadow-xl">
                    <h3 className="text-2xl font-bold mb-2">Still need help?</h3>
                    <p className="text-slate-300 mb-6">Our support team is available Mon-Fri, 9am - 6pm.</p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <a href="mailto:support@mindstar.com" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <span className="material-symbols-outlined">mail</span>
                            support@mindstar.com
                        </a>
                        <a href="tel:+1234567890" className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                            <span className="material-symbols-outlined">call</span>
                            +1 (555) 123-4567
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
