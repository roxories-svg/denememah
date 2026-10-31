import React, { useState } from 'react';
import { X, BookOpen, Search, Zap, Compass, Move, BatteryCharging } from 'lucide-react';

export default function FormulaCheatSheetModal({ isOpen, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Dinamik & Hareket');

  if (!isOpen) return null;

  const formulaCategories = {
    'Dinamik & Hareket': [
      { name: "Newton'ın II. Yasası", formula: "F_net = m · a", desc: "Net kuvvet ivme kazandırır (m: kg, a: m/s²)" },
      { name: "Sürtünme Kuvveti", formula: "f_s = k · N", desc: "N: Yüzeyin dik tepki kuvveti, k: sürtünme katsayısı" },
      { name: "Eğik Düzlem Çekici Bileşen", formula: "F_x = m · g · sin(θ)", desc: "Eğik düzleme paralel aşağı kaydırıcı kuvvet" },
      { name: "Eğik Düzlem Tepki Kuvveti", formula: "N = m · g · cos(θ)", desc: "Yüzeye dik bastıran ağırlık bileşeni" },
      { name: "Atwood İvmesi", formula: "a = (m1 - m2)·g / (m1 + m2)", desc: "Makaralı sistem net ivmesi" }
    ],
    'Vektörler & Bağıl': [
      { name: "Vektör X Bileşeni", formula: "A_x = A · cos(θ)", desc: "Yatay eksen izdüşümü" },
      { name: "Vektör Y Bileşeni", formula: "A_y = A · sin(θ)", desc: "Düşey eksen izdüşümü" },
      { name: "Pisagor Bileşkesi", formula: "R = √(A_x² + A_y²)", desc: "Aralarında 90° olan iki dik vektörün bileşkesi" },
      { name: "Bağıl Hız Bağıntısı", formula: "v_bağıl = v_cisim - v_gözlemci", desc: "Bakanın gözü çıksın kuralı (vektörel fark)" },
      { name: "Nehirde Karşıya Geçiş", formula: "t = d / v_y", desc: "Süre yalnızca akıntıya dik düşey hıza bağlıdır!" }
    ],
    'İş, Güç ve Enerji': [
      { name: "Yapılan İş", formula: "W = F · Δx · cos(θ)", desc: "Kuvvet ile yol doğrultusu aynı olmalı (Joule)" },
      { name: "Kinetik Enerji", formula: "E_k = 1/2 · m · v²", desc: "Hızdan kaynaklanan öteleme enerjisi" },
      { name: "Yerçekimi Potansiyel", formula: "E_p = m · g · h", desc: "Yükseklikten kaynaklanan enerji" },
      { name: "Yay Potansiyel Enerjisi", formula: "E_yay = 1/2 · k · x²", desc: "x: sıkışma/uzama miktarı (metre!)" },
      { name: "Mekanik Güç", formula: "P = W / t = F · v_ort", desc: "Birim zamanda yapılan iş (Watt)" }
    ],
    'Elektrik & Devreler': [
      { name: "Ohm Yasası", formula: "V = I · R", desc: "Gerilim = Akım × Direnç (Volt = Amper × Ohm)" },
      { name: "Seri Direnç", formula: "R_eş = R1 + R2 + ...", desc: "Dirençler doğrudan toplanır" },
      { name: "Paralel Direnç (2 Direnç)", formula: "R_eş = (R1 · R2) / (R1 + R2)", desc: "Çarpımları / Toplamları pratik kuralı" },
      { name: "Coulomb Çekim/İtme", formula: "F = k · |q1 · q2| / d²", desc: "k = 9×10⁹ N·m²/C² elektrostatik sabit" },
      { name: "Elektriksel Güç", formula: "P = V · I = I² · R = V² / R", desc: "Devrede açığa çıkan elektriksel güç" }
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Fizik Yazılı Formül & Bağıntı Kartı</h2>
              <p className="text-xs text-slate-400">Yazılı sınavlar öncesi hızlı göz gezdirme ve tekrar rehberi</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 my-5">
          {Object.keys(formulaCategories).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Formulas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {formulaCategories[activeCategory].map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block mb-1">
                {item.name}
              </span>
              <div className="p-2 rounded-lg bg-slate-900 border border-purple-500/30 font-mono text-sm font-bold text-cyan-300 mb-1.5">
                {item.formula}
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Tüm formüller MEB Lise Fizik Öğretim Programı ile uyumludur.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
