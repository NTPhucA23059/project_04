"use client";

import { useEffect, useState } from "react";
import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel
} from "@headlessui/react";

import {
    MapIcon,
    SunIcon,
    CurrencyDollarIcon,
    StarIcon,
    ChevronDownIcon,
    ChevronUpIcon
} from "@heroicons/react/24/outline";

import { fetchTourCategories } from "../../../services/customer/tourService";

export default function TourFilters({ onChange = () => { } }) {

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [selectedBudget, setSelectedBudget] = useState(null);
    const [selectedRating, setSelectedRating] = useState(null);
    const [categories, setCategories] = useState([]);

    const budgetRanges = [
        { id: 1, min: 0, max: 200 },
        { id: 2, min: 200, max: 500 },
        { id: 3, min: 500, max: 1000 },
        { id: 4, min: 1000, max: 2000 },
        { id: 5, min: 2000, max: Infinity },
    ];

    useEffect(() => {
        async function loadCategories() {
            try {
                const res = await fetchTourCategories();
                const list = res.items || res;
                setCategories(list || []);
            } catch (e) {
                setCategories([]);
            }
        }
        loadCategories();
    }, []);

    useEffect(() => {
        onChange({
            category: selectedCategory,
            season: selectedSeason,
            budget: selectedBudget ? budgetRanges.find(b => b.id === selectedBudget) : null,
            rating: selectedRating
        });
    }, [selectedCategory, selectedSeason, selectedBudget, selectedRating]);

    return (
        <aside className="hidden lg:block w-64 p-6 border-r border-neutral-200 space-y-8 bg-white rounded-xl">

            {/* CATEGORY */}
            <Disclosure defaultOpen={true}>
                {({ open }) => (
                    <FilterSection title="Tour Categories" icon={MapIcon} open={open}>
                        {categories.map(cat => (
                            <FilterToggle
                                key={cat.categoryID || cat.CategoryID}
                                checked={selectedCategory === (cat.categoryID || cat.CategoryID)}
                                label={cat.categoryName || cat.CategoryName}
                                onChange={() =>
                                    setSelectedCategory(prev =>
                                        prev === (cat.categoryID || cat.CategoryID) ? null : (cat.categoryID || cat.CategoryID)
                                    )
                                }
                            />
                        ))}
                    </FilterSection>
                )}
            </Disclosure>

            {/* SEASONS */}
            <Disclosure>
                {({ open }) => (
                    <FilterSection title="Seasons" icon={SunIcon} open={open}>
                        <p className="text-sm text-neutral-500">Coming soon</p>
                    </FilterSection>
                )}
            </Disclosure>

            {/* BUDGET */}
            <Disclosure>
                {({ open }) => (
                    <FilterSection title="Budget (USD)" icon={CurrencyDollarIcon} open={open}>
                        {budgetRanges.map(b => (
                            <FilterToggle
                                key={b.id}
                                checked={selectedBudget === b.id}
                                label={
                                    b.max === Infinity
                                        ? `Above ${b.min} USD`
                                        : `${b.min} - ${b.max} USD`
                                }
                                onChange={() =>
                                    setSelectedBudget(prev =>
                                        prev === b.id ? null : b.id
                                    )
                                }
                            />
                        ))}
                    </FilterSection>
                )}
            </Disclosure>

            {/* RATING */}
            <Disclosure>
                {({ open }) => (
                    <FilterSection title="Rating" icon={StarIcon} open={open}>
                        {[5, 4, 3, 2, 1].map(r => (
                            <FilterToggle
                                key={r}
                                checked={selectedRating === r}
                                label={`${r} stars & up`}
                                onChange={() =>
                                    setSelectedRating(prev =>
                                        prev === r ? null : r
                                    )
                                }
                            />
                        ))}
                    </FilterSection>
                )}
            </Disclosure>

        </aside>
    );
}

function FilterSection({ title, icon: Icon, open, children }) {
    return (
        <div className="border-b border-neutral-200 pb-6">

            <DisclosureButton className="flex w-full justify-between items-center text-neutral-900 font-medium mb-2">
                <span className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary-600" />   {/* Đây mới đúng */}
                    {title}
                </span>

                {open ? (
                    <ChevronUpIcon className="h-5 w-5 text-primary-600" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 text-neutral-700" />
                )}
            </DisclosureButton>

            <DisclosurePanel className="pt-2 space-y-3">
                {children}
            </DisclosurePanel>

        </div>
    );
}


/**
 * RADIO TOGGLE — dùng checkbox giả radio (cho phép click lần 2 để bỏ chọn)
 */
function FilterToggle({ checked, label, onChange }) {
    return (
        <label className="flex items-center gap-3 text-neutral-700 cursor-pointer">
            <input
                type="checkbox"  // ⭐ dùng checkbox để toggle
                checked={checked}
                onChange={onChange}
                className="accent-primary-600 w-4 h-4 rounded-full"
            />
            {label}
        </label>
    );
}
