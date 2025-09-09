/**
OTGER LOGIC
**/


const modals = {
  open: (id, content) => {
    let dialog = document.getElementById(id);
    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = id;
      dialog.className = "modal";
      document.body.appendChild(dialog);
    }

    dialog.innerHTML = `<button class="modal-close" data-close>&times;</button><div class="modal-content">${content}</div>`;
    
    // Remove any existing closing class
    dialog.classList.remove('closing');
    
    // Setup close button
    dialog.querySelector("[data-close]").addEventListener("click", () => modals.close(id), {
      once: true,
    });
    
    // Setup ESC key handling with animation
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      modals.close(id);
    });
    
    // Show modal - use requestAnimationFrame to ensure initial styles are applied
    dialog.showModal();
    
    // Force reflow to ensure initial styles are applied before animation
    dialog.offsetHeight;
    
    // Trigger open animation on next frame
    requestAnimationFrame(() => {
      dialog.setAttribute('open', '');
    });
  },

  close: (id) => {
    const dialog = document.getElementById(id);
    if (dialog && dialog.open) {
      // Add closing class to trigger fade out animation
      dialog.classList.add('closing');
      
      // Wait for animation to complete before actually closing
      setTimeout(() => {
        dialog.close();
        dialog.classList.remove('closing');
        dialog.removeAttribute('open');
      }, 250); // Match the transition duration
    }
  },
};

const uiDialog = {
  confirm(message, { okText = "OK", cancelText = "Cancel", danger = false } = {}) {
    return new Promise((resolve) => {
      const id = "confirm-dialog";
      modals.open(
        id,
        `
        <div class="modal-popover">
          <div class="modal-popover-body">${message}</div>
          <div class="modal-popover-actions">
            <button class="btn btn-muted" data-cancel>${cancelText}</button>
            <button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-ok>${okText}</button>
          </div>
        </div>
      `
      );
      const dlg = document.getElementById(id);
      dlg.classList.add("modal--popover", "modal--sm");
      
      const handleCancel = () => {
        modals.close(id);
        setTimeout(() => resolve(false), 250);
      };
      
      const handleOk = () => {
        modals.close(id);
        setTimeout(() => resolve(true), 250);
      };
      
      dlg.querySelector("[data-cancel]").addEventListener("click", handleCancel, { once: true });
      dlg.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
    });
  },
  
  prompt(message, { okText = "Create", cancelText = "Cancel", placeholder = "", value = "" } = {}) {
    return new Promise((resolve) => {
      const id = "prompt-dialog";
      modals.open(
        id,
        `
        <div class="modal-popover">
          <div class="modal-popover-header">${message}</div>
          <input class="modal-input" type="text" placeholder="${placeholder}" value="${value}">
          <div class="modal-popover-actions">
            <button class="btn btn-muted" data-cancel>${cancelText}</button>
            <button class="btn btn-primary" data-ok>${okText}</button>
          </div>
        </div>
      `
      );
      const dlg = document.getElementById(id);
      dlg.classList.add("modal--popover", "modal--sm");
      const input = dlg.querySelector(".modal-input");
      
      // Focus input after animation
      setTimeout(() => input.focus(), 100);
      
      const handleCancel = () => {
        modals.close(id);
        setTimeout(() => resolve(null), 250);
      };
      
      const handleOk = () => {
        modals.close(id);
        setTimeout(() => resolve(input.value.trim() || null), 250);
      };
      
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleOk();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          handleCancel();
        }
      });
      
      dlg.querySelector("[data-cancel]").addEventListener("click", handleCancel, { once: true });
      dlg.querySelector("[data-ok]").addEventListener("click", handleOk, { once: true });
    });
  },
};



/**
OTHER LOGIC
**/
