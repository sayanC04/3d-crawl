const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add data-node-id to checkRow
html = html.replace(
  'return `<li class="${rowClasses}" style="--stage-color:${stageColor}">',
  'return `<li class="${rowClasses}" data-node-id="${node.id}" style="--stage-color:${stageColor}">'
);

// 2. Change the event listener body
const searchRegex = /checkedMap\[id\] = t\.checked;\s+\/\/ Check if stage just hit 100%.*?renderAll\(\);\s+\}/s;

const replacement = `checkedMap[id] = t.checked;
      
      // Check if stage just hit 100%
      if (stageBefore) {
          const doneAfter = leavesBefore.filter(l=>checkedMap[l.id]).length;
          if (doneBefore < leavesBefore.length && doneAfter === leavesBefore.length) {
              const rect = t.getBoundingClientRect();
              fireConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
          }
      }

      scheduleSave();
      
      // Surgical DOM update instead of full renderStages()
      document.querySelectorAll(".check-item").forEach(li => {
          const nId = li.dataset.nodeId;
          const n = findNode(nId);
          if (n) {
              if (n.isParent && n.children) {
                  const allChecked = n.children.length > 0 && n.children.every(c => checkedMap[c.id]);
                  li.classList.toggle("is-checked", allChecked);
              } else {
                  li.classList.toggle("is-checked", !!checkedMap[nId]);
              }
          }
      });

      // Update stage headers
      if (stageBefore) {
          const s = stageBefore;
          const leaves = leavesOfStage(s);
          const done = leaves.filter(l => checkedMap[l.id]).length;
          const total = leaves.length;
          const pct = total ? done/total*100 : 0;
          
          const stageEl = document.getElementById("stage-" + s.num);
          if (stageEl) {
              const fracEl = stageEl.querySelector(".stage-frac");
              if (fracEl) fracEl.textContent = done + "/" + total;
              
              const pieEl = stageEl.querySelector(".stage-pie");
              if (pieEl) {
                  const color = CATS[s.category];
                  pieEl.style.background = "conic-gradient(" + color + " " + pct + "%, var(--bg-panel-raised) 0)";
              }

              // Also update status labels for filter if needed
              const statusLabel = pct === 100 ? "done" : (pct > 0 ? "partial" : "todo");
              const catMatch = state.cats.has(s.category);
              const statusMatch = state.status === "all" || state.status === statusLabel;
              stageEl.classList.toggle("is-hidden", !(catMatch && statusMatch));

              // Update project groups if any
              if (s.projects) {
                  const groups = stageEl.querySelectorAll(".project-group");
                  s.projects.forEach((p, i) => {
                      if (groups[i]) {
                          const pLeaves = p.items;
                          const pDone = pLeaves.filter(l => checkedMap[l.id]).length;
                          const nameSpan = groups[i].querySelector(".project-name span");
                          if (nameSpan) nameSpan.textContent = "(" + pDone + "/" + pLeaves.length + ")";
                      }
                  });
              }
          }
      }

      // Update other fast components
      renderRail();
      renderSegbar();
      renderStats();
      renderGlance();
    }`;

html = html.replace(searchRegex, replacement);

fs.writeFileSync('index.html', html);
