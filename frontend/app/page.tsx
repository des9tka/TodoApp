"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Sortable from "sortablejs";

import "../styles/landing.css"; // Импортируем глобальные стили

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const sortableRef = useRef<Sortable | null>(null);

    // Определяем статусы и их свойства
    const statuses = [
        {
            name: "TODO",
            color: "red",
            shadowColor: "shadow-red-500/20",
            borderColor: "border-red-500/50",
        },
        {
            name: "IN PROGRESS",
            color: "yellow",
            shadowColor: "shadow-yellow-500/20",
            borderColor: "border-yellow-500/50",
        },
        {
            name: "DONE",
            color: "green",
            shadowColor: "shadow-green-500/20",
            borderColor: "border-green-500/50",
        },
    ];

    // Состояние для хранения порядка карточек
    const [cards, setCards] = useState([
        {
            id: "item1",
            title: "📋 Smart Task",
            description:
                "Categorize, prioritize, and track your daily goals with our intuitive interface. Set deadlines, add notes, and organize tasks into projects for maximum efficiency.",
        },
        {
            id: "item2",
            title: "📱 Mobile Friendly",
            description:
                "Access your tasks anywhere with our fully responsive design. Sync seamlessly across devices to manage your to-dos on the go.",
        },
        {
            id: "item3",
            title: "🔄 Real-Time Sync",
            description:
                "Stay updated with real-time synchronization. Your tasks are always current, whether you're on your phone, tablet, or desktop.",
        },
    ]);

    // Функция для получения статуса карточки по позиции
    const getCardStatus = (index: number) => {
        return statuses[index % statuses.length];
    };

    useEffect(() => {
        if (containerRef.current) {
            sortableRef.current = Sortable.create(containerRef.current, {
                animation: 300,
                ghostClass: "sortable-ghost",
                chosenClass: "sortable-chosen",
                dragClass: "sortable-drag",
                // handle: ".drag-handle", // Удалите или закомментируйте эту строку
                onEnd: (evt) => {
                    if (
                        evt.oldIndex !== undefined &&
                        evt.newIndex !== undefined
                    ) {
                        const newCards = [...cards];
                        const [movedCard] = newCards.splice(evt.oldIndex, 1);
                        newCards.splice(evt.newIndex, 0, movedCard);
                        setCards(newCards);
                    }
                },
            });
        }

        return () => {
            if (sortableRef.current) {
                sortableRef.current.destroy();
            }
        };
    }, [cards]);

    return (
        <div className="min-h-screen text-white flex flex-col px-4 sm:px-6 md:px-8 lg:px-12 py-8">
            <div className="flex-grow bg-black/50 backdrop-blur-md rounded-2xl shadow-2xl p-8 sm:p-10 text-center flex flex-col items-center justify-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-white drop-shadow-lg">
                    Organize Your Life with Ease
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl text-white/80 mb-10 max-w-4xl mx-auto">
                    Welcome to the ultimate ToDo app – simple, fast, and
                    powerful. Track your tasks, set reminders, and achieve your
                    goals with a seamless experience designed to boost your
                    productivity.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 gap-y-6 sm:gap-y-0 justify-center mb-12">
                    <Link href="/auth/signin">
                        <span className="px-8 py-3 rounded-full text-lg font-semibold bg-white text-sky-600 hover:bg-gray-200 transition shadow-md transform hover:scale-105">
                            Sign In
                        </span>
                    </Link>
                    <Link href="/auth/signup">
                        <span className="px-8 py-3 rounded-full text-lg font-semibold bg-sky-600 hover:bg-sky-700 transition shadow-md transform hover:scale-105">
                            <button>Sign Up</button>
                        </span>
                    </Link>
                </div>

                <div className="mb-12 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
                        Why Choose Our ToDo App?
                    </h2>
                    <p className="text-lg text-white/80 max-w-3xl mx-auto">
                        Our app is designed to simplify your life. Whether
                        you're managing personal tasks, work projects, or team
                        collaborations, our lightweight tool help you stay
                        organized and focused. Join thousands of users who trust
                        us to keep
                    </p>
                </div>

                <div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
                    ref={containerRef}
                >
                    {cards.map((card, index) => {
                        const status = getCardStatus(index);
                        // Проверяем, последняя ли это карточка
                        const isLast = index === cards.length - 1;
                        return (
                            <div
                                key={card.id}
                                className={`
                                    ${status.shadowColor} ${status.borderColor}
                                    bg-black/30 border-2 p-6 rounded-xl shadow-lg hover:shadow-xl
                                    transition transform hover:-translate-y-1 relative cursor-grab select-none
                                    ${
                                        isLast
                                            ? "sm:col-span-2 lg:col-span-1 justify-self-center"
                                            : ""
                                    }
                                `}
                            >
                                <div
                                    className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold text-white ${
                                        status.color === "red"
                                            ? "bg-red-500"
                                            : status.color === "yellow"
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                    }`}
                                >
                                    {status.name}
                                </div>

                                <h3 className="text-2xl font-bold mb-3 text-white mt-4">
                                    {card.title}
                                </h3>
                                <p className="text-white/90">
                                    {card.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8 text-sm text-white/20 font-bold italic select-none">
                    Try to drag and drop the cards to reorder them.
                </div>
            </div>
        </div>
    );
}
