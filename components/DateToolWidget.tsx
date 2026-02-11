
import React, { useEffect, useRef } from 'react';

const DateToolWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const widget = containerRef.current;
    const btnCalculate = widget.querySelector('#btnCalculate') as HTMLButtonElement;
    const btnMakeRound = widget.querySelector('#btnMakeRound') as HTMLButtonElement;
    const toggleTot = widget.querySelector('#toggleTot') as HTMLElement;
    const toggleTm = widget.querySelector('#toggleTm') as HTMLElement;
    const resultsArea = widget.querySelector('#resultsArea') as HTMLElement;
    const rounderArea = widget.querySelector('#rounderArea') as HTMLElement;
    const proposalsGrid = widget.querySelector('#proposalsGrid') as HTMLElement;
    const commaWarning = widget.querySelector('#commaWarning') as HTMLElement;

    let currentMode = 'tot';

    const monthMap: Record<string, number> = {
      'jan': 0, 'januari': 0, 'feb': 1, 'februari': 1, 'mrt': 2, 'maart': 2, 'apr': 3, 'april': 3,
      'mei': 4, 'jun': 5, 'juni': 5, 'jul': 6, 'juli': 6, 'aug': 7, 'augustus': 7, 'sep': 8, 'september': 8,
      'okt': 9, 'oktober': 9, 'nov': 10, 'november': 10, 'dec': 11, 'december': 11
    };

    function parseDate(input: string): Date | null {
      input = input.trim().toLowerCase();
      if (!input) return new Date(new Date().setUTCHours(0, 0, 0, 0));

      // ISO: yyyy-mm-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return new Date(input + 'T00:00:00Z');

      // 8 digits: ddmmyyyy
      if (/^\d{8}$/.test(input)) {
        const d = input.substring(0, 2);
        const m = input.substring(2, 4);
        const y = input.substring(4, 8);
        return new Date(`${y}-${m}-${d}T00:00:00Z`);
      }

      // Separated: d-m-y
      const parts = input.split(/[-/.\s]+/);
      if (parts.length === 3) {
        let d = parseInt(parts[0], 10);
        let m: number;
        let y = parseInt(parts[parts.length - 1], 10);

        if (isNaN(parts[1] as any)) {
          m = monthMap[parts[1].substring(0, 3)] ?? -1;
        } else {
          m = parseInt(parts[1], 10) - 1;
        }

        if (m < 0 || m > 11 || isNaN(d) || isNaN(y)) return null;

        if (y < 100) {
          y += y < 70 ? 2000 : 1900;
        }

        const date = new Date(Date.UTC(y, m, d));
        if (date.getUTCDate() !== d) return null;
        return date;
      }
      return null;
    }

    function formatDateNL(date: Date): string {
      const d = String(date.getUTCDate()).padStart(2, '0');
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const y = date.getUTCFullYear();
      return `${d}-${m}-${y}`;
    }

    function calculate() {
      const input1 = (widget.querySelector('#date1') as HTMLInputElement).value;
      const input2 = (widget.querySelector('#date2') as HTMLInputElement).value;
      
      const d1 = parseDate(input1);
      const d2 = parseDate(input2);

      if (!d1 || !d2) {
        alert("Ongeldige datum(s). Gebruik bijv. 20-08-2026");
        return;
      }

      // Normalize inputs
      (widget.querySelector('#date1') as HTMLInputElement).value = formatDateNL(d1);
      (widget.querySelector('#date2') as HTMLInputElement).value = formatDateNL(d2);

      const msPerDay = 86400000;
      let diffDays = Math.round((d2.getTime() - d1.getTime()) / msPerDay);
      if (currentMode === 'tm') diffDays += 1;

      const weeks = diffDays / 7;
      
      // Months/Years logic
      let tempDate = new Date(d1);
      let fullMonths = 0;
      while (true) {
        let nextMonth = new Date(tempDate);
        nextMonth.setUTCMonth(tempDate.getUTCMonth() + 1);
        // Clamp to last day of month if needed
        const expectedMonth = (tempDate.getUTCMonth() + 1) % 12;
        if (nextMonth.getUTCMonth() !== expectedMonth) {
          nextMonth = new Date(Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), 0));
        }
        
        const limitDate = new Date(d2);
        if (currentMode === 'tm') limitDate.setUTCDate(limitDate.getUTCDate() + 1);

        if (nextMonth.getTime() <= limitDate.getTime()) {
          fullMonths++;
          tempDate = nextMonth;
        } else {
          break;
        }
      }

      const limitDate = new Date(d2);
      if (currentMode === 'tm') limitDate.setUTCDate(limitDate.getUTCDate() + 1);
      const restDays = Math.round((limitDate.getTime() - tempDate.getTime()) / msPerDay);
      
      const anchorDate = new Date(tempDate);
      anchorDate.setUTCMonth(tempDate.getUTCMonth() + 1);
      const daysInAnchor = Math.round((anchorDate.getTime() - tempDate.getTime()) / msPerDay);
      
      const monthsFloat = fullMonths + (restDays / daysInAnchor);
      const yearsFloat = monthsFloat / 12;

      // Update UI
      resultsArea.style.display = 'block';
      widget.querySelector('#resSummaryText')!.textContent = `${formatDateNL(d1)} ${currentMode} ${formatDateNL(d2)} duurt`;
      
      const pillVal = monthsFloat.toFixed(2).replace('.', ',');
      widget.querySelector('#resPill')!.textContent = pillVal.endsWith(',00') ? Math.round(monthsFloat) + " maanden" : pillVal + " maanden";

      widget.querySelector('#resDays')!.textContent = diffDays.toLocaleString('nl-NL');
      widget.querySelector('#resWeeks')!.textContent = weeks.toFixed(2).replace('.', ',');
      widget.querySelector('#resMonths')!.textContent = monthsFloat.toFixed(2).replace('.', ',');
      widget.querySelector('#resYears')!.textContent = yearsFloat.toFixed(2).replace('.', ',');

      // Rounding logic
      const diffToRound = Math.abs(weeks - Math.round(weeks));
      commaWarning.style.display = diffToRound > 0.05 ? 'block' : 'none';
      rounderArea.style.display = 'block';
      proposalsGrid.innerHTML = '';

      const targets = [Math.round(weeks), Math.floor(weeks), Math.ceil(weeks)];
      const uniqueTargets = [...new Set(targets)].sort((a,b) => a-b);

      uniqueTargets.forEach(n => {
        let newEnd = new Date(d1);
        newEnd.setUTCDate(d1.getUTCDate() + (n * 7));
        if (currentMode === 'tm') newEnd.setUTCDate(newEnd.getUTCDate() - 1);
        
        const delta = Math.round((newEnd.getTime() - d2.getTime()) / msPerDay);
        const deltaText = delta === 0 ? "Geen verschil" : (delta > 0 ? `+${delta} dagen` : `${delta} dagen`);

        const card = document.createElement('div');
        card.className = 'proposal-card';
        card.innerHTML = `
          <div class="prop-weeks">${n} weken</div>
          <div class="prop-date">${formatDateNL(newEnd)}</div>
          <div class="prop-delta">${deltaText}</div>
          <button class="prop-btn">Kies deze</button>
        `;
        card.querySelector('button')!.onclick = () => {
          (widget.querySelector('#date2') as HTMLInputElement).value = formatDateNL(newEnd);
          calculate();
          // Dispatch
          const result = {
            startISO: d1.toISOString().split('T')[0],
            endISO: newEnd.toISOString().split('T')[0],
            mode: currentMode,
            dagen: diffDays,
            weken: n,
            maanden: monthsFloat,
            jaren: yearsFloat
          };
          (window as any).offertePeriode = result;
          document.dispatchEvent(new CustomEvent("periodeBerekend", { detail: result }));
        };
        proposalsGrid.appendChild(card);
      });

      // Global store & Dispatch
      const finalResult = {
        startISO: d1.toISOString().split('T')[0],
        endISO: d2.toISOString().split('T')[0],
        mode: currentMode,
        dagen: diffDays,
        weken: weeks,
        maanden: monthsFloat,
        jaren: yearsFloat
      };
      (window as any).offertePeriode = finalResult;
      document.dispatchEvent(new CustomEvent("periodeBerekend", { detail: finalResult }));
    }

    toggleTot.onclick = () => {
      currentMode = 'tot';
      toggleTot.classList.add('active');
      toggleTm.classList.remove('active');
    };
    toggleTm.onclick = () => {
      currentMode = 'tm';
      toggleTm.classList.add('active');
      toggleTot.classList.remove('active');
    };
    btnCalculate.onclick = calculate;
    btnMakeRound.onclick = () => {
        const weeks = parseFloat(widget.querySelector('#resWeeks')!.textContent!.replace(',', '.'));
        const target = Math.round(weeks);
        const btns = proposalsGrid.querySelectorAll('.prop-btn');
        // Simple logic: if we have round proposals, find the closest and click it
        proposalsGrid.scrollIntoView({ behavior: 'smooth' });
    };

    // Initialize info icons
    widget.querySelectorAll('.info-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target')!;
        const block = widget.querySelector(`#${targetId}`) as HTMLElement;
        block.style.display = block.style.display === 'none' ? 'block' : 'none';
      });
    });

  }, []);

  return (
    <div id="periodeToolWidget" ref={containerRef}>
      <style>{`
        #periodeToolWidget {
          background: #fff;
          font-family: 'Inter', sans-serif;
          color: #333;
          padding: 24px;
          border-radius: 12px;
          max-width: 100%;
        }
        #periodeToolWidget h2 {
          color: #29543C;
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 24px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .form-row {
          margin-bottom: 16px;
          border-bottom: 1px solid #eee;
          padding-bottom: 16px;
        }
        .form-row:last-child { border-bottom: none; }
        .label-area {
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #29543C;
          text-transform: uppercase;
        }
        .input-group {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .input-group input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
          background: #F5F5E8;
        }
        .info-btn {
          background: #68A87C;
          color: white;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-weight: bold;
          border: none;
          font-size: 12px;
        }
        .info-block {
          background: #F5F5E8;
          border-left: 4px solid #68A87C;
          padding: 10px 12px;
          font-size: 12px;
          margin-top: 8px;
          display: none;
          color: #29543C;
          line-height: 1.4;
        }
        .toggle-group {
          display: flex;
          border: 1px solid #ddd;
          border-radius: 6px;
          overflow: hidden;
          width: fit-content;
        }
        .toggle-btn {
          padding: 8px 20px;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
          font-weight: 700;
          border: none;
          color: #777;
        }
        .toggle-btn.active {
          background: #68A87C;
          color: white;
        }
        .btn-main {
          background: #68A87C;
          color: white;
          border: none;
          padding: 12px 28px;
          border-radius: 6px;
          font-weight: 800;
          cursor: pointer;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-left: auto;
          text-transform: uppercase;
          transition: background 0.2s;
        }
        .btn-main:hover { background: #29543C; }
        
        .results-section h3, .rounder-section h3 {
          font-size: 14px;
          font-weight: 800;
          margin: 24px 0 12px 0;
          text-transform: uppercase;
          color: #29543C;
        }
        .result-bar {
          background: #29543C;
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .pill {
          background: white;
          color: #29543C;
          padding: 4px 12px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 800;
        }
        .details-card {
          background: #F5F5E8;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 13px;
        }
        .detail-row span:first-child { color: #666; font-weight: 600; }
        .detail-row span:last-child { font-weight: 700; color: #29543C; }

        .rounder-section {
          border-top: 1px dashed #ccc;
          margin-top: 24px;
          padding-top: 12px;
        }
        .warning-box {
          background: #fff3e0;
          border-left: 4px solid #ff9800;
          padding: 10px;
          font-size: 11px;
          color: #e65100;
          margin-bottom: 12px;
          font-weight: 700;
        }
        .btn-round {
          background: #29543C;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        .proposals-grid {
          display: grid;
          grid-template-cols: 1fr 1fr 1fr;
          gap: 12px;
        }
        .proposal-card {
          background: #fff;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 12px;
          text-align: center;
          transition: all 0.2s;
        }
        .proposal-card:hover { transform: translateY(-2px); border-color: #68A87C; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .prop-weeks { font-weight: 800; font-size: 14px; margin-bottom: 4px; color: #29543C; }
        .prop-date { font-size: 11px; color: #777; margin-bottom: 4px; }
        .prop-delta { font-size: 10px; font-weight: 700; color: #68A87C; margin-bottom: 12px; }
        .prop-btn {
          background: #F5F5E8;
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 6px 0;
          width: 100%;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          color: #29543C;
          text-transform: uppercase;
        }
        .prop-btn:hover { background: #68A87C; color: white; border-color: #68A87C; }

        @media (max-width: 480px) {
          .proposals-grid { grid-template-cols: 1fr; }
        }
      `}</style>

      <h2>Weken Calculator</h2>

      <div className="form-row">
        <div className="label-area">
          <span>Eerste datum</span>
          <button className="info-btn" data-target="info1">i</button>
        </div>
        <div className="input-group">
          <input type="text" id="date1" placeholder="20-08-2026" />
        </div>
        <div id="info1" className="info-block">
          U kunt datums op veel manieren schrijven (bijv. 4 april 2006, 04-04-06, 04042006). Leeg laten = vandaag.
        </div>
      </div>

      <div className="form-row">
        <div className="label-area">Periode</div>
        <div className="toggle-group">
          <button id="toggleTot" className="toggle-btn active">tot</button>
          <button id="toggleTm" className="toggle-btn">t/m</button>
        </div>
      </div>

      <div className="form-row">
        <div className="label-area">
          <span>Tweede datum</span>
          <button className="info-btn" data-target="info2">i</button>
        </div>
        <div className="input-group">
          <input type="text" id="date2" placeholder="20-01-2027" />
        </div>
        <div id="info2" className="info-block">
          Tot = de einddatum telt niet mee.<br/>T/m = de einddatum telt wel mee.
        </div>
      </div>

      <button id="btnCalculate" className="btn-main">
        Berekenen <span>➜</span>
      </button>

      <div id="resultsArea" className="results-section" style={{display: 'none'}}>
        <h3>Resultaten</h3>
        <div className="result-bar">
          <span id="resSummaryText">20-08-2026 tot 20-01-2027 duurt</span>
          <span id="resPill" className="pill">5 maanden</span>
        </div>
        <div className="details-card">
          <div className="detail-row">
            <span>duurt:</span>
            <span><span id="resDays">153</span> dagen</span>
          </div>
          <div className="detail-row">
            <span>ofwel:</span>
            <span><span id="resWeeks">21,86</span> weken</span>
          </div>
          <div className="detail-row">
            <span>ofwel:</span>
            <span><span id="resMonths">5,00</span> maanden</span>
          </div>
          <div className="detail-row">
            <span>ofwel:</span>
            <span><span id="resYears">0,42</span> jaren</span>
          </div>
        </div>
      </div>

      <div id="rounderArea" className="rounder-section" style={{display: 'none'}}>
        <h3>Rondmaken</h3>
        <div id="commaWarning" className="warning-box" style={{display: 'none'}}>
          ⚠️ Komma-weken: kans op rotgetallen in uren/week.
        </div>
        <button id="btnMakeRound" className="btn-round">Maak rond op volle weken</button>
        <div id="proposalsGrid" className="proposals-grid">
          {/* Proposal cards injected here */}
        </div>
      </div>
    </div>
  );
};

export default DateToolWidget;
