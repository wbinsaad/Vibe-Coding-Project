import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Layout from './components/Layout'
import Create from './routes/Create'
import ScriptEditor from './routes/ScriptEditor'
import LiveMode from './routes/LiveMode'
import Export from './routes/Export'
import { Button } from './components/ui/Button'
import { Card } from './components/ui/Card'

function Home() {
    const features = [
        {
            title: 'Generate Scripts',
            description: 'Create structured interview scripts with AI assistance. Define your research goals and let AI generate comprehensive question sets.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            ),
            color: 'indigo'
        },
        {
            title: 'Run Quality Checks',
            description: 'Analyze your questions for bias and alignment issues. Get AI-powered suggestions to improve question quality.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            color: 'emerald'
        },
        {
            title: 'Live Interview Support',
            description: 'Conduct interviews with real-time tracking, timer management, and AI-powered follow-up suggestions.',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
            color: 'violet'
        }
    ]

    const colorVariants = {
        indigo: {
            bg: 'bg-indigo-50',
            icon: 'text-indigo-600',
            border: 'group-hover:border-indigo-200'
        },
        emerald: {
            bg: 'bg-emerald-50',
            icon: 'text-emerald-600',
            border: 'group-hover:border-emerald-200'
        },
        violet: {
            bg: 'bg-violet-50',
            icon: 'text-violet-600',
            border: 'group-hover:border-violet-200'
        }
    }

    return (
        <div className="space-y-12">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-violet-100 to-indigo-100 rounded-full blur-3xl opacity-50" />

                <div className="relative text-center py-12 lg:py-16">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-sm font-medium text-indigo-700 mb-6">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        AI-Powered Research Tool
                    </div>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 tracking-tight mb-6">
                        Craft Better
                        <span className="block bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                            User Interviews
                        </span>
                    </h1>

                    {/* Tagline */}
                    <p className="text-lg sm:text-xl text-stone-600 max-w-2xl mx-auto mb-8 leading-relaxed">
                        Generate structured interview scripts, run quality checks, and conduct
                        interviews with AI-powered follow-up suggestions — all in one place.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/create">
                            <Button variant="primary" size="lg">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Script
                            </Button>
                        </Link>
                        <Link to="/script/demo-123">
                            <Button variant="secondary" size="lg">
                                View Demo Script
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div>
                <div className="text-center mb-10">
                    <h2 className="text-2xl font-bold text-stone-900 mb-3">
                        Everything you need for UX research
                    </h2>
                    <p className="text-stone-600 max-w-xl mx-auto">
                        From script generation to live interview support, we've got you covered.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            hover
                            padding="md"
                            className={`group ${colorVariants[feature.color].border}`}
                        >
                            <div className={`w-12 h-12 rounded-xl ${colorVariants[feature.color].bg} flex items-center justify-center mb-4`}>
                                <span className={colorVariants[feature.color].icon}>
                                    {feature.icon}
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-stone-900 mb-2">
                                {feature.title}
                            </h3>
                            <p className="text-stone-600 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Quick Start Section */}
            <Card padding="lg" className="bg-gradient-to-br from-stone-50 to-stone-100/50">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold text-stone-900 mb-2">
                            Ready to get started?
                        </h3>
                        <p className="text-stone-600">
                            Create your first interview script in under 5 minutes with AI assistance.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link to="/create">
                            <Button variant="primary">
                                Create Script
                            </Button>
                        </Link>
                        <Link to="/live/demo-123">
                            <Button variant="ghost">
                                Try Live Mode →
                            </Button>
                        </Link>
                    </div>
                </div>
            </Card>

            {/* How It Works */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { step: '1', title: 'Define Goals', desc: 'Set your research objectives' },
                    { step: '2', title: 'Generate Script', desc: 'AI creates structured questions' },
                    { step: '3', title: 'Run Checks', desc: 'Analyze for bias & alignment' },
                    { step: '4', title: 'Interview', desc: 'Conduct with live support' }
                ].map((item, index) => (
                    <div key={index} className="text-center p-6">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm">
                            {item.step}
                        </div>
                        <h4 className="font-semibold text-stone-900 mb-1">{item.title}</h4>
                        <p className="text-sm text-stone-500">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/create" element={<Create />} />
                    <Route path="/script/:scriptId" element={<ScriptEditor />} />
                    <Route path="/live/:scriptId" element={<LiveMode />} />
                    <Route path="/export/:scriptId" element={<Export />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}
