let activeElement: HTMLInputElement | null = null;
let icon: HTMLElement | null = null;

const createIcon = () => {
    const iconWrapper = document.createElement('div');
    iconWrapper.style.position = 'absolute';
    iconWrapper.style.height = '100%';
    iconWrapper.style.right = '8px';
    iconWrapper.style.top = '0';
    iconWrapper.style.display = 'flex';
    iconWrapper.style.alignItems = 'center';
    iconWrapper.style.cursor = 'pointer';
    iconWrapper.style.zIndex = '10000';

    const svgIcon = document.createElement('img');
    svgIcon.src = chrome.runtime.getURL('icons/key-icon.svg');
    svgIcon.style.width = '20px';
    svgIcon.style.height = '20px';
    svgIcon.style.filter = 'saturate(0.5)';
    svgIcon.style.opacity = '0.6';
    
    iconWrapper.appendChild(svgIcon);

    iconWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        chrome.runtime.sendMessage({ type: 'autofill-credentials', action: 'get' }, (credentials) => {
            if (credentials && credentials.length > 0) {
                 // For simplicity, use the first match. A real app might show a dropdown.
                fillForm(credentials[0]);
            }
        });
    });

    return iconWrapper;
};

const fillForm = (credential: {username?: string, password?: string}) => {
    if (!activeElement) return;

    const form = activeElement.closest('form');
    if (!form) return;

    if (credential.username) {
        // Broad selector for username/email fields
        const usernameInput = form.querySelector(
          'input[type="email"], input[type="text"][name*="user"], input[type="text"][name*="email"], input[autocomplete="username"]'
        ) as HTMLInputElement | null;
        if (usernameInput) {
            usernameInput.value = credential.username;
            usernameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    if (credential.password) {
        activeElement.value = credential.password;
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
};

const getWrapper = (input: HTMLInputElement): HTMLElement => {
    let wrapper = input.parentElement;
    if (wrapper && window.getComputedStyle(wrapper).position === 'static') {
        wrapper.style.position = 'relative';
    }
    return wrapper || input;
};

const showIcon = (input: HTMLInputElement) => {
    activeElement = input;
    const wrapper = getWrapper(input);
    if (wrapper) {
        if (!icon) {
            icon = createIcon();
        }
        wrapper.appendChild(icon);
    }
};

const hideIcon = () => {
    // Use timeout to allow click on icon
    setTimeout(() => {
        if (icon && icon.parentElement) {
            icon.parentElement.removeChild(icon);
        }
        activeElement = null;
    }, 100);
};

document.addEventListener('focusin', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.tagName === 'INPUT' && target.type === 'password') {
        showIcon(target);
    }
});

document.addEventListener('focusout', (e) => {
    const target = e.target as HTMLInputElement;
    if (target.tagName === 'INPUT' && target.type === 'password') {
       hideIcon();
    }
});

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'fill-credentials-form') {
        const passwordField = document.querySelector('input[type="password"]') as HTMLInputElement | null;
        if (passwordField) {
            // Ensure icon is visible and element is active before filling
            showIcon(passwordField);
            fillForm(message.credentials);
        }
    }
});
