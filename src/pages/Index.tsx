import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

type Tab = "calc" | "reminder" | "converter" | "finance" | "timecalc" | "percent" | "stats" | "history";

interface Reminder {
  id: string;
  text: string;
  time: string;
  date: string;
  done: boolean;
  color: "green" | "purple" | "orange" | "blue";
}

interface HistoryItem {
  id: string;
  type: string;
  expression: string;
  result: string;
  timestamp: Date;
}

const STORAGE_KEY = "calc_app_data";

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.history) {
      parsed.history = parsed.history.map((h: HistoryItem) => ({ ...h, timestamp: new Date(h.timestamp) }));
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveData(reminders: Reminder[], history: HistoryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ reminders, history, savedAt: new Date().toISOString() }));
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<Tab>("calc");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const data = loadData();
    if (data) {
      if (data.reminders) setReminders(data.reminders);
      if (data.history) setHistory(data.history);
    }
  }, []);

  useEffect(() => {
    saveData(reminders, history);
  }, [reminders, history]);

  const addToHistory = useCallback((type: string, expression: string, result: string) => {
    const item: HistoryItem = { id: Date.now().toString(), type, expression, result, timestamp: new Date() };
    setHistory(prev => [item, ...prev].slice(0, 50));
  }, []);

  const tabs: { id: Tab; label: string; icon: string; color: string }[] = [
    { id: "calc", label: "Калькулятор", icon: "Calculator", color: "neon-green" },
    { id: "reminder", label: "Напоминания", icon: "Bell", color: "neon-orange" },
    { id: "converter", label: "Конвертер", icon: "ArrowLeftRight", color: "neon-blue" },
    { id: "finance", label: "Финансы", icon: "TrendingUp", color: "neon-purple" },
    { id: "timecalc", label: "Время", icon: "Timer", color: "neon-blue" },
    { id: "percent", label: "Проценты", icon: "Percent", color: "neon-green" },
    { id: "stats", label: "Статистика", icon: "BarChart3", color: "neon-green" },
    { id: "history", label: "История", icon: "Clock", color: "neon-orange" },
  ];

  return (
    <div className="min-h-screen grid-bg relative overflow-hidden" style={{ fontFamily: "'Golos Text', sans-serif" }}>
      {/* Декоративные пятна */}
      <div className="fixed top-[-20%] right-[-10%] w-96 h-96 rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #00ffb3 0%, transparent 70%)" }} />
      <div className="fixed bottom-[-20%] left-[-10%] w-80 h-80 rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #b87dff 0%, transparent 70%)" }} />

      <div className="max-w-md mx-auto min-h-screen flex flex-col relative z-10">
        {/* Header */}
        <header className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black tracking-tight" style={{ fontFamily: "'Oswald', sans-serif" }}>
                <span className="neon-green">КАЛЬК</span>
                <span className="text-white/40 font-light text-lg ml-2">HUB</span>
              </h1>
              <p className="text-xs text-white/30 mt-0.5">умный помощник</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse-neon" style={{ background: "#00ffb3" }} />
              <span className="text-xs text-white/30">синхр.</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 pb-4 overflow-auto">
          {activeTab === "calc" && <CalcTab onHistory={addToHistory} />}
          {activeTab === "reminder" && <ReminderTab reminders={reminders} setReminders={setReminders} />}
          {activeTab === "converter" && <ConverterTab onHistory={addToHistory} />}
          {activeTab === "finance" && <FinanceTab onHistory={addToHistory} />}
          {activeTab === "timecalc" && <TimeCalcTab onHistory={addToHistory} />}
          {activeTab === "percent" && <PercentTab onHistory={addToHistory} />}
          {activeTab === "stats" && <StatsTab history={history} reminders={reminders} />}
          {activeTab === "history" && <HistoryTab history={history} setHistory={setHistory} />}
        </main>

        {/* Navigation */}
        <nav className="px-3 py-2 mx-3 mb-4 rounded-2xl" style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
        }}>
          <div className="grid grid-cols-4 gap-1 mb-1">
            {tabs.slice(0, 4).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                style={activeTab === tab.id ? { color: `var(--${tab.color})` } : {}}
              >
                <Icon name={tab.icon} size={18} />
                <span className="text-[9px] font-medium leading-tight text-center">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-1">
            {tabs.slice(4).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
                style={activeTab === tab.id ? { color: `var(--${tab.color})` } : {}}
              >
                <Icon name={tab.icon} size={18} />
                <span className="text-[9px] font-medium leading-tight text-center">{tab.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}

/* ============================================================
   КАЛЬКУЛЯТОР
   ============================================================ */
function CalcTab({ onHistory }: { onHistory: (t: string, e: string, r: string) => void }) {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [waitNext, setWaitNext] = useState(false);

  const handleNum = (n: string) => {
    if (waitNext) { setDisplay(n); setWaitNext(false); return; }
    setDisplay(prev => prev === "0" ? n : prev.length > 12 ? prev : prev + n);
  };

  const handleOp = (op: string) => {
    setExpression(display + " " + op);
    setWaitNext(true);
  };

  const handleDot = () => {
    if (waitNext) { setDisplay("0."); setWaitNext(false); return; }
    if (!display.includes(".")) setDisplay(prev => prev + ".");
  };

  const handleEq = () => {
    if (!expression) return;
    try {
      const parts = expression.trim().split(" ");
      const left = parseFloat(parts[0]);
      const op = parts[1];
      const right = parseFloat(display);
      let res = 0;
      if (op === "+") res = left + right;
      else if (op === "−") res = left - right;
      else if (op === "×") res = left * right;
      else if (op === "÷") res = right !== 0 ? left / right : NaN;
      const resStr = isNaN(res) ? "Ошибка" : String(parseFloat(res.toFixed(10)));
      onHistory("Калькулятор", expression + " " + display, resStr);
      setDisplay(resStr);
      setExpression("");
      setWaitNext(true);
    } catch { setDisplay("Ошибка"); }
  };

  const handleClear = () => { setDisplay("0"); setExpression(""); setWaitNext(false); };
  const handlePlusMinus = () => setDisplay(prev => prev.startsWith("-") ? prev.slice(1) : "-" + prev);
  const handlePercent = () => setDisplay(prev => String(parseFloat(prev) / 100));

  const btns = [
    { label: "C", type: "clear" }, { label: "+/−", type: "special" }, { label: "%", type: "special" }, { label: "÷", type: "op" },
    { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" }, { label: "×", type: "op" },
    { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" }, { label: "−", type: "op" },
    { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" }, { label: "+", type: "op" },
    { label: "0", type: "num", wide: true }, { label: ".", type: "num" }, { label: "=", type: "eq" },
  ];

  const handleBtn = (label: string, type: string) => {
    if (type === "num" || label === ".") {
      if (label === ".") handleDot();
      else handleNum(label);
    } else if (type === "op") handleOp(label);
    else if (type === "eq") handleEq();
    else if (label === "C") handleClear();
    else if (label === "+/−") handlePlusMinus();
    else if (label === "%") handlePercent();
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold neon-green" style={{ fontFamily: "'Oswald', sans-serif" }}>КАЛЬКУЛЯТОР</h2>
        <span className="badge-green">Стандартный</span>
      </div>

      {/* Display */}
      <div className="calc-display mb-4">
        <div className="text-white/40 text-sm h-5 mb-1">{expression || " "}</div>
        <div className="text-4xl font-black tracking-tight neon-green truncate">
          {display.length > 10 ? parseFloat(parseFloat(display).toFixed(6)).toString() : display}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2.5">
        {btns.map((btn, i) => (
          <button
            key={i}
            onClick={() => handleBtn(btn.label, btn.type)}
            className={`calc-btn h-14 ${'wide' in btn && btn.wide ? "col-span-2" : ""} ${
              btn.type === "op" ? "calc-btn-op" :
              btn.type === "eq" ? "calc-btn-eq" :
              btn.type === "clear" ? "calc-btn-clear" :
              btn.type === "special" ? "calc-btn-special" : ""
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   НАПОМИНАНИЯ
   ============================================================ */
function ReminderTab({ reminders, setReminders }: {
  reminders: Reminder[];
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>;
}) {
  const [text, setText] = useState("");
  const [time, setTime] = useState("09:00");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const colors: Reminder["color"][] = ["green", "purple", "orange", "blue"];
  const [colorIdx, setColorIdx] = useState(0);

  const colorMap = {
    green: { border: "rgba(0,255,179,0.25)", dot: "#00ffb3" },
    purple: { border: "rgba(184,125,255,0.25)", dot: "#b87dff" },
    orange: { border: "rgba(255,123,58,0.25)", dot: "#ff7b3a" },
    blue: { border: "rgba(58,171,255,0.25)", dot: "#3aabff" },
  };

  const addReminder = () => {
    if (!text.trim()) return;
    const r: Reminder = { id: Date.now().toString(), text: text.trim(), time, date, done: false, color: colors[colorIdx] };
    setReminders(prev => [r, ...prev]);
    setText("");
    setColorIdx(prev => (prev + 1) % 4);
  };

  const toggle = (id: string) => setReminders(prev => prev.map(r => r.id === id ? { ...r, done: !r.done } : r));
  const remove = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));

  const active = reminders.filter(r => !r.done);
  const done = reminders.filter(r => r.done);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold neon-orange" style={{ fontFamily: "'Oswald', sans-serif" }}>НАПОМИНАНИЯ</h2>
        <span className="badge-orange">{active.length} активных</span>
      </div>

      {/* Форма */}
      <div className="rounded-2xl p-4 mb-4 card-neon-orange" style={{ background: "rgba(255,123,58,0.05)" }}>
        <input
          className="neo-input mb-3 text-sm"
          placeholder="Что нужно сделать..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && addReminder()}
        />
        <div className="flex gap-2 mb-3">
          <input type="date" className="neo-input text-sm flex-1" value={date} onChange={e => setDate(e.target.value)} />
          <input type="time" className="neo-input text-sm w-28" value={time} onChange={e => setTime(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {colors.map((c, i) => (
              <button key={c} onClick={() => setColorIdx(i)}
                className="w-5 h-5 rounded-full transition-transform"
                style={{
                  background: colorMap[c].dot,
                  transform: colorIdx === i ? "scale(1.3)" : "scale(1)",
                  border: colorIdx === i ? "2px solid white" : "none"
                }} />
            ))}
          </div>
          <button onClick={addReminder}
            className="ml-auto px-4 py-1.5 rounded-xl text-sm font-bold"
            style={{ background: "rgba(255,123,58,0.8)", color: "white" }}>
            + Добавить
          </button>
        </div>
      </div>

      {/* Список */}
      <div className="space-y-2">
        {active.map(r => (
          <div key={r.id} className="rounded-xl p-3 flex items-start gap-3 transition-all"
            style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${colorMap[r.color].border}` }}>
            <button onClick={() => toggle(r.id)} className="mt-0.5 shrink-0">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                style={{ borderColor: colorMap[r.color].dot }}>
              </div>
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90 truncate">{r.text}</p>
              <p className="text-xs text-white/40 mt-0.5">{r.date} в {r.time}</p>
            </div>
            <button onClick={() => remove(r.id)} className="text-white/20 hover:text-white/60 transition-colors">
              <Icon name="X" size={14} />
            </button>
          </div>
        ))}
        {done.length > 0 && (
          <>
            <p className="text-xs text-white/30 pt-2 pb-1">Выполненные</p>
            {done.map(r => (
              <div key={r.id} className="rounded-xl p-3 flex items-start gap-3 opacity-40"
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <button onClick={() => toggle(r.id)} className="mt-0.5 shrink-0">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: colorMap[r.color].dot }}>
                    <Icon name="Check" size={10} />
                  </div>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-sm line-through text-white/60 truncate">{r.text}</p>
                </div>
                <button onClick={() => remove(r.id)} className="text-white/20 hover:text-white/60">
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </>
        )}
        {reminders.length === 0 && (
          <div className="text-center py-10 text-white/30">
            <Icon name="Bell" size={36} />
            <p className="mt-2 text-sm">Добавь первое напоминание</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   КОНВЕРТЕР
   ============================================================ */
const CURRENCY_RATES: Record<string, number> = {
  RUB: 1, USD: 89.5, EUR: 97.2, GBP: 113.4, CNY: 12.3, JPY: 0.59, TRY: 2.78, KZT: 0.19,
};

const UNIT_CATEGORIES: Record<string, Record<string, number>> = {
  "Длина": { м: 1, км: 1000, см: 0.01, мм: 0.001, ми: 1609.34, фут: 0.3048, дюйм: 0.0254 },
  "Вес": { кг: 1, г: 0.001, мг: 0.000001, т: 1000, фунт: 0.453592, унция: 0.0283495 },
  "Температура": { Цельсий: 1, Фаренгейт: 1, Кельвин: 1 },
  "Площадь": { "м²": 1, "км²": 1e6, "см²": 0.0001, "га": 10000, "акр": 4046.86 },
  "Объём": { л: 1, мл: 0.001, "м³": 1000, "галлон": 3.78541 },
};

function convertUnits(val: number, from: string, to: string, category: string): number {
  if (category === "Температура") {
    if (from === to) return val;
    let celsius = val;
    if (from === "Фаренгейт") celsius = (val - 32) * 5 / 9;
    if (from === "Кельвин") celsius = val - 273.15;
    if (to === "Фаренгейт") return celsius * 9 / 5 + 32;
    if (to === "Кельвин") return celsius + 273.15;
    return celsius;
  }
  const rates = UNIT_CATEGORIES[category];
  return val * rates[from] / rates[to];
}

function ConverterTab({ onHistory }: { onHistory: (t: string, e: string, r: string) => void }) {
  const [mode, setMode] = useState<"currency" | "units">("currency");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("RUB");
  const [value, setValue] = useState("1");
  const [unitCategory, setUnitCategory] = useState("Длина");
  const [unitFrom, setUnitFrom] = useState("м");
  const [unitTo, setUnitTo] = useState("км");

  const currencies = Object.keys(CURRENCY_RATES);
  const unitKeys = Object.keys(UNIT_CATEGORIES);

  const convertedCurrency = value && !isNaN(Number(value))
    ? (Number(value) * CURRENCY_RATES[to] / CURRENCY_RATES[from]).toFixed(2)
    : "0";

  const unitFromKeys = Object.keys(UNIT_CATEGORIES[unitCategory]);
  const convertedUnit = value && !isNaN(Number(value))
    ? convertUnits(Number(value), unitFrom, unitTo, unitCategory).toFixed(6).replace(/\.?0+$/, "")
    : "0";

  const handleConvert = () => {
    if (mode === "currency") {
      onHistory("Конвертер", `${value} ${from}`, `${convertedCurrency} ${to}`);
    } else {
      onHistory("Конвертер", `${value} ${unitFrom}`, `${convertedUnit} ${unitTo}`);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold neon-blue" style={{ fontFamily: "'Oswald', sans-serif" }}>КОНВЕРТЕР</h2>
        <div className="flex gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
          {(["currency", "units"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
              style={mode === m ? { background: "rgba(58,171,255,0.2)", color: "#3aabff" } : { color: "rgba(255,255,255,0.4)" }}>
              {m === "currency" ? "Валюты" : "Единицы"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-4 card-neon-blue" style={{ background: "rgba(58,171,255,0.04)" }}>
        {mode === "currency" ? (
          <>
            <input type="number" className="neo-input mb-3 text-lg font-bold" value={value} onChange={e => setValue(e.target.value)} placeholder="Введите сумму" />
            <div className="flex items-center gap-2 mb-4">
              <select className="neo-input flex-1 text-sm" value={from} onChange={e => setFrom(e.target.value)}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => { setFrom(to); setTo(from); }} className="shrink-0 p-2 rounded-xl transition-colors hover:bg-white/10">
                <Icon name="ArrowLeftRight" size={16} style={{ color: "#3aabff" }} />
              </button>
              <select className="neo-input flex-1 text-sm" value={to} onChange={e => setTo(e.target.value)}>
                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="rounded-xl p-3 mb-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(58,171,255,0.2)" }}>
              <p className="text-xs text-white/40 mb-1">Результат</p>
              <p className="text-3xl font-black neon-blue">{convertedCurrency} <span className="text-lg">{to}</span></p>
            </div>
            <p className="text-xs text-white/30 text-center">Курс на сегодня (демо)</p>
          </>
        ) : (
          <>
            <select className="neo-input mb-3 text-sm" value={unitCategory}
              onChange={e => {
                setUnitCategory(e.target.value);
                const keys = Object.keys(UNIT_CATEGORIES[e.target.value]);
                setUnitFrom(keys[0]);
                setUnitTo(keys[1]);
              }}>
              {unitKeys.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="number" className="neo-input mb-3 text-lg font-bold" value={value} onChange={e => setValue(e.target.value)} placeholder="Введите значение" />
            <div className="flex items-center gap-2 mb-4">
              <select className="neo-input flex-1 text-sm" value={unitFrom} onChange={e => setUnitFrom(e.target.value)}>
                {unitFromKeys.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
              <button onClick={() => { setUnitFrom(unitTo); setUnitTo(unitFrom); }} className="shrink-0 p-2 rounded-xl hover:bg-white/10 transition-colors">
                <Icon name="ArrowLeftRight" size={16} style={{ color: "#3aabff" }} />
              </button>
              <select className="neo-input flex-1 text-sm" value={unitTo} onChange={e => setUnitTo(e.target.value)}>
                {unitFromKeys.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
            <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(58,171,255,0.2)" }}>
              <p className="text-xs text-white/40 mb-1">Результат</p>
              <p className="text-3xl font-black neon-blue">{convertedUnit} <span className="text-lg">{unitTo}</span></p>
            </div>
          </>
        )}
        <button onClick={handleConvert} className="w-full mt-3 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: "rgba(58,171,255,0.2)", color: "#3aabff", border: "1px solid rgba(58,171,255,0.3)" }}>
          Сохранить в историю
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ФИНАНСОВЫЙ КАЛЬКУЛЯТОР
   ============================================================ */
function FinanceTab({ onHistory }: { onHistory: (t: string, e: string, r: string) => void }) {
  const [mode, setMode] = useState<"credit" | "deposit" | "budget">("credit");
  const [amount, setAmount] = useState("500000");
  const [rate, setRate] = useState("12");
  const [months, setMonths] = useState("24");
  const [income, setIncome] = useState("100000");
  const [expenses, setExpenses] = useState("60000");

  const calcCredit = () => {
    const P = Number(amount), r = Number(rate) / 100 / 12, n = Number(months);
    if (r === 0) return { monthly: P / n, total: P, overpay: 0 };
    const monthly = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    const total = monthly * n;
    return { monthly, total, overpay: total - P };
  };

  const calcDeposit = () => {
    const P = Number(amount), r = Number(rate) / 100, n = Number(months) / 12;
    const result = P * Math.pow(1 + r, n);
    return { result, profit: result - P };
  };

  const credit = calcCredit();
  const deposit = calcDeposit();
  const balance = Number(income) - Number(expenses);
  const savingsRate = Number(income) > 0 ? (balance / Number(income) * 100).toFixed(1) : "0";

  const fmt = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 });

  const handleSave = () => {
    if (mode === "credit") onHistory("Кредит", `${fmt(Number(amount))} руб на ${months} мес. под ${rate}%`, `${fmt(credit.monthly)} руб/мес`);
    if (mode === "deposit") onHistory("Вклад", `${fmt(Number(amount))} руб на ${months} мес. под ${rate}%`, `${fmt(deposit.result)} руб`);
    if (mode === "budget") onHistory("Бюджет", `Доход ${fmt(Number(income))} - расходы ${fmt(Number(expenses))}`, `Остаток ${fmt(balance)} руб`);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold neon-purple" style={{ fontFamily: "'Oswald', sans-serif" }}>ФИНАНСЫ</h2>
        <span className="badge-purple">Калькулятор</span>
      </div>

      <div className="flex gap-1 rounded-xl p-1 mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
        {([["credit", "Кредит"], ["deposit", "Вклад"], ["budget", "Бюджет"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={mode === id ? { background: "rgba(184,125,255,0.2)", color: "#b87dff" } : { color: "rgba(255,255,255,0.4)" }}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-4 card-neon-purple space-y-3" style={{ background: "rgba(184,125,255,0.04)" }}>
        {(mode === "credit" || mode === "deposit") && (
          <>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Сумма, ₽</label>
              <input type="number" className="neo-input" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-white/40 mb-1 block">Ставка, %</label>
                <input type="number" className="neo-input" value={rate} onChange={e => setRate(e.target.value)} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/40 mb-1 block">Месяцев</label>
                <input type="number" className="neo-input" value={months} onChange={e => setMonths(e.target.value)} />
              </div>
            </div>
          </>
        )}

        {mode === "budget" && (
          <>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Доход в месяц, ₽</label>
              <input type="number" className="neo-input" value={income} onChange={e => setIncome(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Расходы в месяц, ₽</label>
              <input type="number" className="neo-input" value={expenses} onChange={e => setExpenses(e.target.value)} />
            </div>
          </>
        )}

        <div className="rounded-xl p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(184,125,255,0.2)" }}>
          {mode === "credit" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Платёж/мес</span>
                <span className="text-xl font-black neon-purple">{fmt(credit.monthly)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/40">Итого</span>
                <span className="text-sm font-semibold text-white/80">{fmt(credit.total)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/40">Переплата</span>
                <span className="text-sm font-semibold" style={{ color: "#ff7b3a" }}>{fmt(credit.overpay)} ₽</span>
              </div>
            </div>
          )}
          {mode === "deposit" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Сумма в конце</span>
                <span className="text-xl font-black neon-purple">{fmt(deposit.result)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/40">Прибыль</span>
                <span className="text-sm font-semibold" style={{ color: "#00ffb3" }}>+{fmt(deposit.profit)} ₽</span>
              </div>
            </div>
          )}
          {mode === "budget" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Остаток</span>
                <span className="text-xl font-black" style={{ color: balance >= 0 ? "#00ffb3" : "#ff7b3a" }}>{fmt(balance)} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-white/40">Норма сбережений</span>
                <span className="text-sm font-semibold" style={{ color: Number(savingsRate) > 20 ? "#00ffb3" : "#ff7b3a" }}>{savingsRate}%</span>
              </div>
              <div className="progress-bar mt-2">
                <div className="progress-fill" style={{
                  width: `${Math.min(100, Math.max(0, Number(savingsRate)))}%`,
                  background: Number(savingsRate) > 20 ? "#00ffb3" : "#ff7b3a"
                }} />
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSave} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: "rgba(184,125,255,0.2)", color: "#b87dff", border: "1px solid rgba(184,125,255,0.3)" }}>
          Сохранить расчёт
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   СТАТИСТИКА
   ============================================================ */
function StatsTab({ history, reminders }: { history: HistoryItem[]; reminders: Reminder[] }) {
  const typeCount: Record<string, number> = {};
  history.forEach(h => { typeCount[h.type] = (typeCount[h.type] || 0) + 1; });

  const total = history.length;
  const maxCount = Math.max(...Object.values(typeCount), 1);

  const typeColors: Record<string, string> = {
    "Калькулятор": "#00ffb3",
    "Конвертер": "#3aabff",
    "Кредит": "#b87dff",
    "Вклад": "#b87dff",
    "Бюджет": "#b87dff",
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    return {
      day: ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"][d.getDay() === 0 ? 6 : d.getDay() - 1],
      count: history.filter(h => h.timestamp.toISOString().split("T")[0] === key).length
    };
  });

  const maxBar = Math.max(...last7.map(d => d.count), 1);

  return (
    <div className="animate-fade-in-up space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold neon-green" style={{ fontFamily: "'Oswald', sans-serif" }}>СТАТИСТИКА</h2>
        <span className="badge-green">{total} расчётов</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Расчётов", value: total, icon: "Calculator", color: "#00ffb3" },
          { label: "Напоминаний", value: reminders.length, icon: "Bell", color: "#ff7b3a" },
          { label: "Выполнено", value: reminders.filter(r => r.done).length, icon: "CheckCircle", color: "#b87dff" },
          { label: "Активных", value: reminders.filter(r => !r.done).length, icon: "Clock", color: "#3aabff" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${color}30` }}>
            <div className="flex items-center justify-between mb-2">
              <Icon name={icon} size={16} style={{ color }} />
              <span className="text-2xl font-black" style={{ color }}>{value}</span>
            </div>
            <p className="text-xs text-white/40">{label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-4 card-neon-green" style={{ background: "rgba(0,255,179,0.03)" }}>
        <p className="text-xs text-white/40 mb-3">Активность за 7 дней</p>
        <div className="flex items-end gap-2 h-20">
          {last7.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-sm transition-all duration-500"
                style={{
                  height: `${Math.max(4, (d.count / maxBar) * 64)}px`,
                  background: d.count > 0 ? "rgba(0,255,179,0.6)" : "rgba(255,255,255,0.06)"
                }} />
              <span className="text-[10px] text-white/30">{d.day}</span>
            </div>
          ))}
        </div>
      </div>

      {Object.keys(typeCount).length > 0 && (
        <div className="rounded-2xl p-4 card-neon-purple" style={{ background: "rgba(184,125,255,0.03)" }}>
          <p className="text-xs text-white/40 mb-3">По категориям</p>
          <div className="space-y-2.5">
            {Object.entries(typeCount).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">{type}</span>
                  <span style={{ color: typeColors[type] || "#b87dff" }}>{count}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${(count / maxCount) * 100}%`,
                    background: typeColors[type] || "#b87dff"
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-10 text-white/30">
          <Icon name="BarChart3" size={36} />
          <p className="mt-2 text-sm">Статистика появится после расчётов</p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ИСТОРИЯ
   ============================================================ */
function HistoryTab({ history, setHistory }: {
  history: HistoryItem[];
  setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
}) {
  const typeColors: Record<string, string> = {
    "Калькулятор": "#00ffb3",
    "Конвертер": "#3aabff",
    "Кредит": "#b87dff",
    "Вклад": "#b87dff",
    "Бюджет": "#b87dff",
  };

  const typeIcons: Record<string, string> = {
    "Калькулятор": "Calculator",
    "Конвертер": "ArrowLeftRight",
    "Кредит": "TrendingUp",
    "Вклад": "TrendingUp",
    "Бюджет": "Wallet",
  };

  const grouped = history.reduce((acc, item) => {
    const date = item.timestamp.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold neon-orange" style={{ fontFamily: "'Oswald', sans-serif" }}>ИСТОРИЯ</h2>
        {history.length > 0 && (
          <button onClick={() => setHistory([])} className="text-xs text-white/30 hover:text-white/60 transition-colors">
            Очистить
          </button>
        )}
      </div>

      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="mb-4">
          <p className="text-xs text-white/30 mb-2 px-1">{date}</p>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${typeColors[item.type] || "#b87dff"}15` }}>
                  <Icon name={typeIcons[item.type] || "Calculator"} size={14}
                    style={{ color: typeColors[item.type] || "#b87dff" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/40 mb-0.5">{item.type}</p>
                  <p className="text-sm text-white/80 truncate">{item.expression}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold" style={{ color: typeColors[item.type] || "#b87dff" }}>
                    {item.result}
                  </p>
                  <p className="text-[10px] text-white/30">
                    {item.timestamp.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {history.length === 0 && (
        <div className="text-center py-10 text-white/30">
          <Icon name="Clock" size={36} />
          <p className="mt-2 text-sm">История расчётов пуста</p>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   КАЛЬКУЛЯТОР ВРЕМЕНИ
   ============================================================ */
function TimeCalcTab({ onHistory }: { onHistory: (t: string, e: string, r: string) => void }) {
  const [mode, setMode] = useState<"diff" | "add" | "countdown">("diff");

  // Разница между датами
  const [dateFrom, setDateFrom] = useState(new Date().toISOString().slice(0, 16));
  const [dateTo, setDateTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().slice(0, 16);
  });

  // Прибавить/отнять
  const [baseDate, setBaseDate] = useState(new Date().toISOString().slice(0, 16));
  const [addValue, setAddValue] = useState("7");
  const [addUnit, setAddUnit] = useState<"days" | "hours" | "minutes" | "months" | "years">("days");
  const [addSign, setAddSign] = useState<"plus" | "minus">("plus");

  // Таймер до события
  const [eventDate, setEventDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().slice(0, 16);
  });
  const [eventName, setEventName] = useState("Новый год");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (mode !== "countdown") return;
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, [mode]);

  // Вычисление разницы
  const diffMs = new Date(dateTo).getTime() - new Date(dateFrom).getTime();
  const diffSign = diffMs >= 0 ? 1 : -1;
  const absDiff = Math.abs(diffMs);
  const diffDays = Math.floor(absDiff / 86400000);
  const diffHours = Math.floor((absDiff % 86400000) / 3600000);
  const diffMinutes = Math.floor((absDiff % 3600000) / 60000);
  const diffSeconds = Math.floor((absDiff % 60000) / 1000);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30.44);
  const diffYears = Math.floor(diffDays / 365.25);

  // Вычисление прибавления
  const computedDate = (() => {
    const d = new Date(baseDate);
    const val = Number(addValue) * (addSign === "plus" ? 1 : -1);
    if (addUnit === "days") d.setDate(d.getDate() + val);
    else if (addUnit === "hours") d.setHours(d.getHours() + val);
    else if (addUnit === "minutes") d.setMinutes(d.getMinutes() + val);
    else if (addUnit === "months") d.setMonth(d.getMonth() + val);
    else if (addUnit === "years") d.setFullYear(d.getFullYear() + val);
    return d;
  })();

  // Таймер обратного отсчёта
  const countMs = new Date(eventDate).getTime() - now.getTime();
  const isPast = countMs < 0;
  const absCount = Math.abs(countMs);
  const cntDays = Math.floor(absCount / 86400000);
  const cntHours = Math.floor((absCount % 86400000) / 3600000);
  const cntMins = Math.floor((absCount % 3600000) / 60000);
  const cntSecs = Math.floor((absCount % 60000) / 1000);

  const fmtDate = (d: Date) => d.toLocaleString("ru-RU", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const handleSave = () => {
    if (mode === "diff") {
      onHistory("Время", `От ${new Date(dateFrom).toLocaleDateString("ru-RU")} до ${new Date(dateTo).toLocaleDateString("ru-RU")}`,
        `${diffSign < 0 ? "−" : ""}${diffDays} дн. ${diffHours} ч. ${diffMinutes} мин.`);
    } else if (mode === "add") {
      onHistory("Время", `${new Date(baseDate).toLocaleDateString("ru-RU")} ${addSign === "plus" ? "+" : "−"} ${addValue} ${addUnit}`,
        fmtDate(computedDate));
    } else {
      onHistory("Время", `До: ${eventName}`, `${cntDays} дн. ${cntHours} ч. ${cntMins} мин.`);
    }
  };

  const unitLabels: Record<string, string> = { days: "дней", hours: "часов", minutes: "минут", months: "месяцев", years: "лет" };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold neon-blue" style={{ fontFamily: "'Oswald', sans-serif" }}>ВРЕМЯ</h2>
        <span className="badge-green" style={{ background: "rgba(58,171,255,0.15)", color: "#3aabff", border: "1px solid rgba(58,171,255,0.3)" }}>Калькулятор</span>
      </div>

      {/* Переключатель режимов */}
      <div className="flex gap-1 rounded-xl p-1 mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
        {([["diff", "Разница"], ["add", "Прибавить"], ["countdown", "Обратный счёт"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={mode === id
              ? { background: "rgba(58,171,255,0.2)", color: "#3aabff" }
              : { color: "rgba(255,255,255,0.4)" }}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-4 card-neon-blue space-y-3" style={{ background: "rgba(58,171,255,0.04)" }}>

        {/* РАЗНИЦА */}
        {mode === "diff" && (
          <>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Начальная дата</label>
              <input type="datetime-local" className="neo-input text-sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Конечная дата</label>
              <input type="datetime-local" className="neo-input text-sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </div>
            <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(58,171,255,0.2)" }}>
              {diffSign < 0 && <p className="text-xs mb-2" style={{ color: "#ff7b3a" }}>Конечная дата раньше начальной</p>}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Дней", val: diffDays },
                  { label: "Часов", val: diffDays * 24 + diffHours },
                  { label: "Недель", val: diffWeeks },
                  { label: "Месяцев", val: diffMonths },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center p-2 rounded-lg" style={{ background: "rgba(58,171,255,0.08)" }}>
                    <p className="text-xl font-black" style={{ color: "#3aabff" }}>{val.toLocaleString("ru-RU")}</p>
                    <p className="text-xs text-white/40">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <p className="text-xs text-white/40 mb-1">Точно</p>
                <p className="text-sm font-semibold text-white/80">
                  {diffYears > 0 && `${diffYears} г. `}{diffDays % 365} дн. {diffHours} ч. {diffMinutes} мин. {diffSeconds} сек.
                </p>
              </div>
            </div>
          </>
        )}

        {/* ПРИБАВИТЬ */}
        {mode === "add" && (
          <>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Начальная дата</label>
              <input type="datetime-local" className="neo-input text-sm" value={baseDate} onChange={e => setBaseDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                {(["plus", "minus"] as const).map(s => (
                  <button key={s} onClick={() => setAddSign(s)}
                    className="w-8 h-8 rounded-lg text-sm font-bold transition-all"
                    style={addSign === s
                      ? { background: s === "plus" ? "rgba(0,255,179,0.2)" : "rgba(255,123,58,0.2)", color: s === "plus" ? "#00ffb3" : "#ff7b3a" }
                      : { color: "rgba(255,255,255,0.3)" }}>
                    {s === "plus" ? "+" : "−"}
                  </button>
                ))}
              </div>
              <input type="number" min="1" className="neo-input flex-1 text-lg font-bold" value={addValue}
                onChange={e => setAddValue(e.target.value)} />
              <select className="neo-input text-sm" style={{ width: "110px" }} value={addUnit}
                onChange={e => setAddUnit(e.target.value as typeof addUnit)}>
                {Object.entries(unitLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(58,171,255,0.2)" }}>
              <p className="text-xs text-white/40 mb-2">Результат</p>
              <p className="text-xl font-black" style={{ color: "#3aabff" }}>
                {fmtDate(computedDate)}
              </p>
              <p className="text-xs text-white/30 mt-1">
                {computedDate.toLocaleDateString("ru-RU", { weekday: "long" })}
              </p>
            </div>
          </>
        )}

        {/* ОБРАТНЫЙ СЧЁТ */}
        {mode === "countdown" && (
          <>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Название события</label>
              <input className="neo-input text-sm" placeholder="Например: День рождения" value={eventName}
                onChange={e => setEventName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Дата события</label>
              <input type="datetime-local" className="neo-input text-sm" value={eventDate} onChange={e => setEventDate(e.target.value)} />
            </div>
            <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(58,171,255,0.2)" }}>
              <p className="text-xs text-white/40 mb-3 text-center">
                {isPast ? "Событие прошло" : `До: ${eventName || "события"}`}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: cntDays, label: "дней" },
                  { val: cntHours, label: "часов" },
                  { val: cntMins, label: "минут" },
                  { val: cntSecs, label: "секунд" },
                ].map(({ val, label }) => (
                  <div key={label} className="text-center p-2 rounded-xl"
                    style={{ background: isPast ? "rgba(255,123,58,0.08)" : "rgba(58,171,255,0.08)" }}>
                    <p className="text-2xl font-black tabular-nums"
                      style={{ color: isPast ? "#ff7b3a" : "#3aabff" }}>
                      {String(val).padStart(2, "0")}
                    </p>
                    <p className="text-[10px] text-white/40">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <button onClick={handleSave} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: "rgba(58,171,255,0.2)", color: "#3aabff", border: "1px solid rgba(58,171,255,0.3)" }}>
          Сохранить в историю
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   КАЛЬКУЛЯТОР ПРОЦЕНТОВ
   ============================================================ */
function PercentTab({ onHistory }: { onHistory: (t: string, e: string, r: string) => void }) {
  const [mode, setMode] = useState<"ofnum" | "change" | "ratio">("ofnum");

  const [base, setBase] = useState("10000");
  const [pct, setPct] = useState("15");

  const [changeNum, setChangeNum] = useState("5000");
  const [changePct, setChangePct] = useState("20");
  const [changeSign, setChangeSign] = useState<"plus" | "minus">("plus");

  const [ratioA, setRatioA] = useState("750");
  const [ratioB, setRatioB] = useState("3000");

  const fmt = (n: number) => isNaN(n) || !isFinite(n)
    ? "—"
    : n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });

  const pctValue = (Number(base) * Number(pct)) / 100;
  const pctWithout = Number(base) - pctValue;
  const pctWith = Number(base) + pctValue;

  const changeDelta = (Number(changeNum) * Number(changePct)) / 100;
  const changeResult = changeSign === "plus"
    ? Number(changeNum) + changeDelta
    : Number(changeNum) - changeDelta;

  const ratioResult = (Number(ratioA) / Number(ratioB)) * 100;

  const handleSave = () => {
    if (mode === "ofnum") {
      onHistory("Проценты", `${pct}% от ${fmt(Number(base))}`, fmt(pctValue));
    } else if (mode === "change") {
      onHistory("Проценты", `${fmt(Number(changeNum))} ${changeSign === "plus" ? "+" : "−"} ${changePct}%`, fmt(changeResult));
    } else {
      onHistory("Проценты", `${fmt(Number(ratioA))} от ${fmt(Number(ratioB))}`, `${fmt(ratioResult)}%`);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold neon-green" style={{ fontFamily: "'Oswald', sans-serif" }}>ПРОЦЕНТЫ</h2>
        <span className="badge-green">Калькулятор</span>
      </div>

      <div className="flex gap-1 rounded-xl p-1 mb-4" style={{ background: "rgba(255,255,255,0.05)" }}>
        {([["ofnum", "% от числа"], ["change", "+/− %"], ["ratio", "Число в %"]] as const).map(([id, label]) => (
          <button key={id} onClick={() => setMode(id)}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={mode === id
              ? { background: "rgba(0,255,179,0.15)", color: "#00ffb3" }
              : { color: "rgba(255,255,255,0.4)" }}>
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl p-4 card-neon-green space-y-3" style={{ background: "rgba(0,255,179,0.03)" }}>

        {mode === "ofnum" && (
          <>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-white/40 mb-1 block">Число</label>
                <input type="number" className="neo-input text-lg font-bold" value={base} onChange={e => setBase(e.target.value)} />
              </div>
              <div style={{ width: "100px" }}>
                <label className="text-xs text-white/40 mb-1 block">Процент %</label>
                <input type="number" className="neo-input text-lg font-bold" value={pct} onChange={e => setPct(e.target.value)} />
              </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,255,179,0.15)" }}>
              {[
                { label: `${pct}% от числа`, value: fmt(pctValue), color: "#00ffb3", big: true },
                { label: `Число − ${pct}% (скидка)`, value: fmt(pctWithout), color: "#3aabff", big: false },
                { label: `Число + ${pct}% (наценка)`, value: fmt(pctWith), color: "#ff7b3a", big: false },
              ].map(({ label, value, color, big }) => (
                <div key={label} className="flex justify-between items-center px-4 py-3"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <span className="text-xs text-white/50">{label}</span>
                  <span className={`font-black tabular-nums ${big ? "text-2xl" : "text-base"}`} style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {mode === "change" && (
          <>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Исходное число</label>
              <input type="number" className="neo-input text-lg font-bold" value={changeNum} onChange={e => setChangeNum(e.target.value)} />
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex gap-1 rounded-xl p-1" style={{ background: "rgba(255,255,255,0.05)" }}>
                {(["plus", "minus"] as const).map(s => (
                  <button key={s} onClick={() => setChangeSign(s)}
                    className="w-9 h-9 rounded-lg text-lg font-black transition-all"
                    style={changeSign === s
                      ? { background: s === "plus" ? "rgba(0,255,179,0.2)" : "rgba(255,123,58,0.2)", color: s === "plus" ? "#00ffb3" : "#ff7b3a" }
                      : { color: "rgba(255,255,255,0.3)" }}>
                    {s === "plus" ? "+" : "−"}
                  </button>
                ))}
              </div>
              <div className="flex-1">
                <label className="text-xs text-white/40 mb-1 block">Процент %</label>
                <input type="number" className="neo-input text-lg font-bold" value={changePct} onChange={e => setChangePct(e.target.value)} />
              </div>
            </div>
            <div className="rounded-xl p-4" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,255,179,0.15)" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-white/40">Изменение</span>
                <span className="text-base font-bold" style={{ color: changeSign === "plus" ? "#00ffb3" : "#ff7b3a" }}>
                  {changeSign === "plus" ? "+" : "−"}{fmt(changeDelta)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/40">Результат</span>
                <span className="text-3xl font-black" style={{ color: changeSign === "plus" ? "#00ffb3" : "#ff7b3a" }}>
                  {fmt(changeResult)}
                </span>
              </div>
            </div>
          </>
        )}

        {mode === "ratio" && (
          <>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Часть</label>
              <input type="number" className="neo-input text-lg font-bold" value={ratioA} onChange={e => setRatioA(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Целое</label>
              <input type="number" className="neo-input text-lg font-bold" value={ratioB} onChange={e => setRatioB(e.target.value)} />
            </div>
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(0,255,179,0.15)" }}>
              <p className="text-xs text-white/40 mb-2">{fmt(Number(ratioA))} — это … от {fmt(Number(ratioB))}</p>
              <p className="text-5xl font-black neon-green tabular-nums">{fmt(ratioResult)}<span className="text-2xl">%</span></p>
              <div className="progress-bar mt-4">
                <div className="progress-fill" style={{
                  width: `${Math.min(100, Math.max(0, ratioResult))}%`,
                  background: "linear-gradient(90deg, #00ffb3, #3aabff)"
                }} />
              </div>
            </div>
          </>
        )}

        <button onClick={handleSave} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: "rgba(0,255,179,0.15)", color: "#00ffb3", border: "1px solid rgba(0,255,179,0.3)" }}>
          Сохранить в историю
        </button>
      </div>
    </div>
  );
}