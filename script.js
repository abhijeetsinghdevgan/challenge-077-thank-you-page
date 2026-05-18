/* ==========================================================================
   INTERACTIVE ENGINE - CHALLENGE #077: INTERACTIVE THANK YOU DASHBOARD
   ========================================================================== */

$(document).ready(function () {
    // Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Fade in dashboard container on load
    $('.dashboard-container').css({ opacity: 0, display: 'flex' }).animate({ opacity: 1 }, 1000);

    /* ==========================================================================
       1. WEB AUDIO API SYNTHESIZER (8-BIT SOUND GENERATOR)
       ========================================================================== */
    let soundEnabled = true;
    let audioCtx = null;

    // Initialize Audio Context on first click/interaction (browser security standard)
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // Toggle Audio Controls
    $('#btn-sound-toggle').on('click', function () {
        initAudio();
        soundEnabled = !soundEnabled;
        $('#sound-icon-on, #sound-icon-off').toggleClass('hidden');
        
        // Play quick feedback sound if enabled
        if (soundEnabled) {
            playBubbleSFX(600, 0.08);
        }
    });

    // Retro 8-bit Bubble Sweep SFX
    function playBubbleSFX(startFreq = 400, duration = 0.15) {
        if (!soundEnabled) return;
        initAudio();
        try {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(startFreq, audioCtx.currentTime);
            // Sweep frequency up rapidly
            osc.frequency.exponentialRampToValueAtTime(startFreq * 2.2, audioCtx.currentTime + duration);
            
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            console.warn("Audio Context failed: ", e);
        }
    }

    // Paper Scratch Scratching SFX (short noise blip)
    function playScratchSFX() {
        if (!soundEnabled) return;
        initAudio();
        try {
            const bufferSize = audioCtx.sampleRate * 0.05; // 50ms noise
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            
            // Generate white noise
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            const noise = audioCtx.createBufferSource();
            noise.buffer = buffer;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 1200;
            
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
            
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            noise.start();
        } catch (e) {
            console.warn("Scratch SFX failed: ", e);
        }
    }

    // Success Fanfare SFX (Arpeggio major chord)
    function playSuccessSFX() {
        if (!soundEnabled) return;
        initAudio();
        try {
            const now = audioCtx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C4, E4, G4, C5, E5, G5, C6
            const duration = 0.09;
            
            notes.forEach((freq, index) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + (index * 0.07));
                
                gain.gain.setValueAtTime(0, now + (index * 0.07));
                gain.gain.linearRampToValueAtTime(0.08, now + (index * 0.07) + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.001, now + (index * 0.07) + duration);
                
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.start(now + (index * 0.07));
                osc.stop(now + (index * 0.07) + duration);
            });
        } catch (e) {
            console.warn("Success SFX failed: ", e);
        }
    }


    /* ==========================================================================
       2. CANVAS CONFETTI PARTICLE SYSTEM (Zero Dependency Engine)
       ========================================================================= */
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    let confettiAnimationId = null;

    function resizeConfettiCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeConfettiCanvas();
    $(window).on('resize', resizeConfettiCanvas);

    class ConfettiParticle {
        constructor(x, y, colorCode) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 6;
            this.color = colorCode;
            this.speedX = Math.random() * 12 - 6;
            this.speedY = Math.random() * -15 - 5; // Launch upwards
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 8 - 4;
            this.gravity = 0.35;
            this.drag = 0.98;
            this.wobble = Math.random() * 0.05 + 0.02;
            this.wobbleSpeed = Math.random() * 0.15;
            this.wobbleCounter = 0;
            this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
        }

        update() {
            this.speedX *= this.drag;
            this.speedY += this.gravity;
            this.x += this.speedX + Math.sin(this.wobbleCounter) * 0.6;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            this.wobbleCounter += this.wobbleSpeed;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            
            if (this.shape === 'circle') {
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            ctx.restore();
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles = particles.filter(p => p.y < canvas.height + 20 && p.x > -20 && p.x < canvas.width + 20);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        if (particles.length > 0) {
            confettiAnimationId = requestAnimationFrame(animateConfetti);
        } else {
            cancelAnimationFrame(confettiAnimationId);
            confettiAnimationId = null;
        }
    }

    // Trigger full screen confetti burst from primary points
    function triggerConfettiBlast(density = 100, originX = null, originY = null) {
        // Core curated aesthetic colors (purples, pinks, cyan, gold, corals)
        const colors = [
            '#a78bfa', '#8b5cf6', '#c084fc', // Purples
            '#22d3ee', '#06b6d4',             // Cyans
            '#fbbf24', '#f59e0b',             // Golds
            '#fb7185', '#f43f5e',             // Pinks/Red
            '#f97316'                         // Corals
        ];

        const x = originX || canvas.width / 2;
        const y = originY || canvas.height * 0.65;

        for (let i = 0; i < density; i++) {
            const colorCode = colors[Math.floor(Math.random() * colors.length)];
            particles.push(new ConfettiParticle(x, y, colorCode));
        }

        if (!confettiAnimationId) {
            animateConfetti();
        }
    }


    /* ==========================================================================
       3. INTERACTIVE 3D PERSPECTIVE TILT
       ========================================================================== */
    function register3DTilt(triggerId, targetId, shadowId) {
        const $trigger = $(triggerId);
        const $target = $(targetId);
        const $shadow = $(shadowId);

        $trigger.on('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            // Mouse coordinate relative to card center (-1 to 1 range)
            const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
            const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);

            // Maximum rotation degree limits
            const rotateX = -mouseY * 16;
            const rotateY = mouseX * 16;

            // Apply 3D matrix rotations
            $target.css({
                transform: `rotateY(${rotateY}deg) rotateX(${rotateX}deg) scale3d(1.04, 1.04, 1.04)`
            });

            // Cast dynamic opposite side shadows
            if ($shadow.length) {
                const shadowX = -mouseX * 25;
                const shadowY = 30 + (-mouseY * 10);
                $shadow.css({
                    transform: `translateX(${shadowX}px) translateY(${shadowY}px) rotateX(85deg) scale(0.95)`,
                    filter: `blur(${12 + Math.abs(mouseX) * 4}px)`,
                    opacity: 0.85
                });
            }
        });

        // Reset to initial orientation on mouse leave
        $trigger.on('mouseleave', function () {
            $target.css({
                transform: `rotateY(-20deg) rotateX(10deg)` // eBook default perspective rotation
            });
            
            if (triggerId === '#phone-perspective-box') {
                $target.css({ transform: `rotateY(0deg) rotateX(0deg)` }); // Phone default flat
            }

            if ($shadow.length) {
                $shadow.css({
                    transform: triggerId === '#book-perspective-box' 
                        ? `rotateX(85deg) rotateY(-5deg) translateY(60px)` 
                        : `rotateX(85deg) translateY(20px)`,
                    filter: `blur(10px)`,
                    opacity: 0.6
                });
            }
        });
    }

    // Initialize 3D tilting variables
    register3DTilt('#phone-perspective-box', '.phone-mockup', '.box-shadow-3d');
    register3DTilt('#book-perspective-box', '.book-container-3d', '.box-shadow-3d-book');


    /* ==========================================================================
       4. STATE/MODE MANAGER - APP VS EBOOK
       ========================================================================== */
    $('.toggle-btn').on('click', function () {
        const $this = $(this);
        if ($this.hasClass('active')) return;

        const targetState = $this.data('target');
        
        // Play blip chime
        playBubbleSFX(targetState === 'app' ? 450 : 380, 0.12);

        // Toggle state buttons active CSS
        $('.toggle-btn').removeClass('active');
        $this.addClass('active');

        // Transition main visual lights
        if (targetState === 'app') {
            $('body').removeClass('mode-ebook').addClass('mode-app');
            // Transition main panels
            $('#state-ebook').removeClass('active');
            $('#visual-ebook').removeClass('active');
            setTimeout(() => {
                $('#state-ebook').hide();
                $('#visual-ebook').hide();
                $('#state-app').show().addClass('active');
                $('#visual-app').show().addClass('active');
            }, 300);
            
            // Adjust Robot Mascot Voice
            updateMascotText("Configuring the app bundle now! Tap me to throw confetti. 🚀");
        } else {
            $('body').removeClass('mode-app').addClass('mode-ebook');
            // Transition main panels
            $('#state-app').removeClass('active');
            $('#visual-app').removeClass('active');
            setTimeout(() => {
                $('#state-app').hide();
                $('#visual-app').hide();
                $('#state-ebook').show().addClass('active');
                $('#visual-ebook').show().addClass('active');
                
                // Initialize scratch card canvas dynamically when eBook card renders
                initScratchCard();
            }, 300);

            // Adjust Robot Mascot Voice
            updateMascotText("Excellent literature choice. Also, look at the mystery bonus below! 🎁");
        }

        // Trigger a tiny transition particle burst
        triggerConfettiBlast(30);
    });

    // Speech bubble text transition utility
    function updateMascotText(newMsg) {
        const $speech = $('#mascot-speech');
        $speech.animate({ opacity: 0 }, 150, function () {
            $(this).text(newMsg).animate({ opacity: 1 }, 250);
        });
    }


    /* ==========================================================================
       5. LIVE PROGRESS SIMULATION (APP DOWNLOAD STATE)
       ========================================================================== */
    let progressTimer = null;
    let currentProgress = 0;

    function simulateAppDownload() {
        clearInterval(progressTimer);
        currentProgress = 0;
        $('#app-progress-fill').css('width', '0%');
        $('#app-progress-percent').text('0%');
        $('#app-progress-status').text('Connecting to secure cloud host...');
        $('#btn-app-action').prop('disabled', true).html('<i data-lucide="loader"></i> <span>Awaiting Stream...</span>');
        lucide.createIcons();

        // Reset Checklist Items
        $('#step-install, #step-complete').removeClass('checked active');
        $('#step-install-icon').html('2');
        $('#step-complete-icon').html('3');
        $('#step-install-desc').text('Extracting configuration presets to project directory...');

        let speed = 4.2;

        progressTimer = setInterval(function () {
            // Speed fluctuations
            speed = Math.max(1.2, Math.min(28.4, speed + (Math.random() * 6 - 3))).toFixed(1);
            $('#app-download-speed').html(`<i data-lucide="gauge"></i> Speed: ${speed} MB/s`);
            lucide.createIcons();

            // Progress steps
            const stepIncrement = Math.floor(Math.random() * 5) + 1;
            currentProgress = Math.min(100, currentProgress + stepIncrement);

            // Update Progress HTML
            $('#app-progress-fill').css('width', `${currentProgress}%`);
            $('#app-progress-percent').text(`${currentProgress}%`);

            // Phase messages & status updates
            if (currentProgress < 20) {
                $('#app-progress-status').text('Establishing mirror nodes...');
            } else if (currentProgress >= 20 && currentProgress < 50) {
                $('#app-progress-status').text('Syncing graphical textures (aether_core.pak)...');
            } else if (currentProgress >= 50 && currentProgress < 80) {
                $('#app-progress-status').text('Decompressing layout assets & modules...');
                
                // Active configuration milestone check
                if (!$('#step-install').hasClass('active') && !$('#step-install').hasClass('checked')) {
                    $('#step-install').addClass('active');
                    playBubbleSFX(500, 0.08);
                }
            } else if (currentProgress >= 80 && currentProgress < 100) {
                $('#app-progress-status').text('Running cryptographic checksum security signatures...');
                
                // Completed configuration milestone check
                if (!$('#step-install').hasClass('checked')) {
                    $('#step-install').removeClass('active').addClass('checked');
                    $('#step-install-icon').html('<i data-lucide="check"></i>');
                    $('#step-install-desc').text('Integration modules successfully loaded.');
                    $('#step-complete').addClass('active');
                    playBubbleSFX(650, 0.1);
                    lucide.createIcons();
                }
            } else if (currentProgress === 100) {
                clearInterval(progressTimer);
                
                // Finish completely
                $('#app-progress-status').text('Aether Dashboard successfully compiled!');
                $('#step-complete').removeClass('active').addClass('checked');
                $('#step-complete-icon').html('<i data-lucide="check"></i>');
                lucide.createIcons();

                // Swap buttons
                $('#btn-app-action').prop('disabled', false).removeClass('app-style').addClass('success-action').html('<i data-lucide="external-link"></i> <span>Launch Dashboard</span>');
                lucide.createIcons();

                // Trigger animations
                playSuccessSFX();
                triggerConfettiBlast(120);
                updateMascotText("Boom! Setup is complete. You can now launch the dashboard sandbox! 🍾");
            }
        }, 150 + Math.random() * 150);
    }

    // Trigger simulation immediately on startup
    simulateAppDownload();

    // Re-install action trigger
    $('#btn-app-retrigger').on('click', function () {
        playBubbleSFX(400, 0.08);
        simulateAppDownload();
    });

    // Launch Sandbox Action Button click
    $('#btn-app-action').on('click', function () {
        if ($(this).prop('disabled')) return;
        playSuccessSFX();
        triggerConfettiBlast(80);
        updateMascotText("Hooray! Opening visual sandbox environment. Enjoy your code journey! 💻");
        
        // Mock loading window overlay
        alert("🎉 Mock Sandbox environment opened successfully in Aether UI Hub!");
    });


    /* ==========================================================================
       6. HTML5 CANVAS SCRATCH-OFF CARD ENGINE
       ========================================================================== */
    let scratchCardInitialized = false;

    function initScratchCard() {
        if (scratchCardInitialized) return; // Prevent duplicate setup
        
        const sCanvas = document.getElementById('scratch-canvas');
        if (!sCanvas) return;
        
        const sCtx = sCanvas.getContext('2d');
        let isDrawing = false;
        let clearPercentTriggered = false;

        // Reset elements
        clearPercentTriggered = false;
        $('#scratch-gift-reveal').css({ opacity: 1, zIndex: 1 });
        $('#scratch-canvas').css({ opacity: 1, pointerEvents: 'auto' });
        $('#scratch-percent-indicator').text('Scratch card above (0% cleared)').css('color', 'var(--text-muted)');

        // Clear canvas
        sCtx.clearRect(0, 0, sCanvas.width, sCanvas.height);

        // 1. Create brushed metallic silver surface
        const metalGrad = sCtx.createLinearGradient(0, 0, sCanvas.width, sCanvas.height);
        metalGrad.addColorStop(0, '#a1a8b8');
        metalGrad.addColorStop(0.3, '#cbd5e1');
        metalGrad.addColorStop(0.5, '#94a3b8');
        metalGrad.addColorStop(0.8, '#cbd5e1');
        metalGrad.addColorStop(1, '#64748b');
        
        sCtx.fillStyle = metalGrad;
        sCtx.fillRect(0, 0, sCanvas.width, sCanvas.height);

        // Add some noise texture to make the silver cover look very realistic
        for (let i = 0; i < 4000; i++) {
            const rx = Math.random() * sCanvas.width;
            const ry = Math.random() * sCanvas.height;
            sCtx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.08})`;
            sCtx.fillRect(rx, ry, 1.5, 1.5);
        }

        // Draw dotted decorative inner card border
        sCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        sCtx.lineWidth = 2;
        sCtx.setLineDash([6, 4]);
        sCtx.strokeRect(10, 10, sCanvas.width - 20, sCanvas.height - 20);

        // 2. Draw modern instructional typography on silver coating
        sCtx.setLineDash([]); // clear dash rules
        sCtx.shadowColor = 'rgba(0,0,0,0.15)';
        sCtx.shadowBlur = 4;
        
        sCtx.fillStyle = 'hsl(230, 20%, 15%)';
        sCtx.font = '800 16px "Outfit", sans-serif';
        sCtx.textAlign = 'center';
        sCtx.fillText('CLAIM MY SECRET GIFT', sCanvas.width / 2, sCanvas.height / 2 - 8);

        sCtx.fillStyle = 'hsl(230, 15%, 35%)';
        sCtx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        sCtx.fillText('SCRATCH WITH YOUR MOUSE OR TOUCH', sCanvas.width / 2, sCanvas.height / 2 + 16);

        // Reset shadow configurations
        sCtx.shadowColor = 'transparent';
        sCtx.shadowBlur = 0;

        // 3. Scratch interaction callbacks
        function scratch(e) {
            if (!isDrawing) return;
            
            const rect = sCanvas.getBoundingClientRect();
            let clientX, clientY;

            // Handle touch vs mouse interfaces
            if (e.touches && e.touches[0]) {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            } else {
                clientX = e.clientX;
                clientY = e.clientY;
            }

            // Target coordinate math scaled correctly
            const x = (clientX - rect.left) * (sCanvas.width / rect.width);
            const y = (clientY - rect.top) * (sCanvas.height / rect.height);

            // Draw transparent stroke (destination-out) to erase silver
            sCtx.globalCompositeOperation = 'destination-out';
            sCtx.beginPath();
            sCtx.arc(x, y, 22, 0, Math.PI * 2); // Scratch path radius size
            sCtx.fill();

            // Play scraping blips dynamically on drag
            if (Math.random() > 0.6) {
                playScratchSFX();
            }

            // Recalculate scratched ratios
            checkScratchPercent();
        }

        // Binds listeners
        $(sCanvas).on('mousedown touchstart', function (e) {
            isDrawing = true;
            scratch(e);
        });

        $(window).on('mousemove touchmove', function (e) {
            if (isDrawing) {
                scratch(e);
            }
        });

        $(window).on('mouseup touchend', function () {
            isDrawing = false;
        });

        // 4. Scratched Percentage Checker (Canvas Alpha scans)
        function checkScratchPercent() {
            if (clearPercentTriggered) return;

            const imgData = sCtx.getImageData(0, 0, sCanvas.width, sCanvas.height);
            const totalPixels = imgData.data.length / 4;
            let transparentPixels = 0;

            for (let i = 0; i < imgData.data.length; i += 4) {
                // scanning transparency channel (index + 3)
                if (imgData.data[i + 3] < 128) {
                    transparentPixels++;
                }
            }

            const percent = Math.floor((transparentPixels / totalPixels) * 100);
            $('#scratch-percent-indicator').text(`Scratch card above (${percent}% cleared)`);

            // Once 60% is scratched, automatically reveal the entire gift beautifully
            if (percent >= 60) {
                clearPercentTriggered = true;
                isDrawing = false;
                
                // Fade out card coating
                $('#scratch-canvas').animate({ opacity: 0 }, 500, function () {
                    $(this).css('pointer-events', 'none');
                    $('#scratch-percent-indicator').text('Gift unlocked! HORIZON50 active.').css('color', 'var(--primary-color)');
                });

                // Fanfare effects
                playSuccessSFX();
                triggerConfettiBlast(90);
                updateMascotText("Omg! You unlocked the HORIZON50 VIP coupon! Enjoy 50% off our courses! 🏆");
            }
        }

        scratchCardInitialized = true;
    }

    // Coupon Code Copy Action
    $('#btn-copy-coupon').on('click', function () {
        const couponText = "HORIZON50";
        navigator.clipboard.writeText(couponText).then(function () {
            playBubbleSFX(680, 0.1);
            
            const $copyBtn = $('#btn-copy-coupon');
            $copyBtn.addClass('copied').html('<i data-lucide="check"></i> <span>Copied!</span>');
            lucide.createIcons();

            setTimeout(function () {
                $copyBtn.removeClass('copied').html('<i data-lucide="copy"></i> <span>Copy Code</span>');
                lucide.createIcons();
            }, 2500);

            updateMascotText("Coupon code copied to clipboard! Ready for your shopping spree. 💳");
        }).catch(function (err) {
            console.error("Clipboard copy failed: ", err);
        });
    });


    /* ==========================================================================
       7. SVG ROBOT PUPIL TRACKING & HOVER INTERACTIONS
       ========================================================================== */
    $(document).on('mousemove', function (e) {
        const mascot = document.getElementById('joy-mascot');
        if (!mascot) return;

        const rect = mascot.getBoundingClientRect();
        const mascotCenterX = rect.left + rect.width / 2;
        const mascotCenterY = rect.top + rect.height / 2;

        const dx = e.clientX - mascotCenterX;
        const dy = e.clientY - mascotCenterY;
        const angle = Math.atan2(dy, dx);
        
        // Max pupil offset radius inside socket
        const distance = Math.min(4, Math.hypot(dx, dy) / 40);

        const pupilX = Math.cos(angle) * distance;
        const pupilY = Math.sin(angle) * distance;

        // Apply pupils transforms dynamically relative to center
        $('.pupil-left').attr('cx', 86 + pupilX).attr('cy', 76 + pupilY);
        $('.pupil-right').attr('cx', 114 + pupilX).attr('cy', 76 + pupilY);
    });

    // Mascot click fun triggers
    $('#joy-mascot').on('click', function () {
        playBubbleSFX(500, 0.15);
        triggerConfettiBlast(30, this.getBoundingClientRect().left + 70, this.getBoundingClientRect().top + 50);

        // Spin character
        const $group = $('.mascot-body-group');
        $group.css({
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: 'rotate(360deg) scale(1)'
        });
        
        setTimeout(() => {
            $group.css({
                transition: 'none',
                transform: 'rotate(0deg)'
            });
        }, 600);

        // Adorable funny robot quote prompts
        const quotes = [
            "Warning: Clicking me increases app performance by 0.003%!",
            "I once read that eBook. The code inside is pure poetry! 🤖📖",
            "Beep Boop! Download secured. I can now sleep happy! 🔋",
            "Wow, you have a very stable mouse cursor. Impressive!",
            "Fun fact: If you click me 100 times, my engineers might buy me a cupcake!",
            "Did you know programmers only drink coffee to convert it into lines of code?",
            "Look at my eyes! They follow you everywhere. I see you! 👀"
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        updateMascotText(randomQuote);
    });


    /* ==========================================================================
       8. DYNAMIC FEEDBACK STAR RATING WIDGET
       ========================================================================== */
    const starButtons = $('.star-btn');
    let selectedRating = 0;

    // Hover styling physics
    starButtons.on('mouseenter', function () {
        const currentStarIndex = $(this).data('rating');
        
        starButtons.each(function () {
            const index = $(this).data('rating');
            if (index <= currentStarIndex) {
                $(this).addClass('hovered');
            } else {
                $(this).removeClass('hovered');
            }
        });
    });

    // Reset hover class states on leave
    $('#star-rating').on('mouseleave', function () {
        starButtons.removeClass('hovered');
    });

    // Handle Star Selection Click events
    starButtons.on('click', function () {
        selectedRating = $(this).data('rating');
        
        starButtons.removeClass('selected');
        
        starButtons.each(function () {
            const index = $(this).data('rating');
            if (index <= selectedRating) {
                $(this).addClass('selected');
            }
        });

        // Unique emotional expressions and confetti explosions depending on review stars
        let responseMsg = "";
        let synthChimeFreq = 300;
        
        if (selectedRating === 1) {
            responseMsg = "Oh no! We will work harder! 😢";
            synthChimeFreq = 220;
            updateMascotText("A single star? I will download some tissues for my circuits... 🔌😭");
            // Change robot eyes visual mood (translucent red)
            $('svg').css('--eye-socket-bg', 'rgba(239, 68, 68, 0.15)');
        } else if (selectedRating === 2) {
            responseMsg = "Thanks! We'll keep improving. 🥺";
            synthChimeFreq = 300;
            updateMascotText("Two stars! I'm scanning my components to fix any issues! ⚙️🔍");
            $('svg').css('--eye-socket-bg', 'rgba(245, 158, 11, 0.1)');
        } else if (selectedRating === 3) {
            responseMsg = "Sweet! A solid feedback. 🙂";
            synthChimeFreq = 420;
            updateMascotText("Three stars! Average is cool, but let's make it legendary! 👍");
            $('svg').css('--eye-socket-bg', 'rgba(255, 255, 255, 0.05)');
        } else if (selectedRating === 4) {
            responseMsg = "Awesome! Super glad you like it. 🥰";
            synthChimeFreq = 520;
            updateMascotText("Four stars! Awesome human! You made my motherboard blush. 💖");
            $('svg').css('--eye-socket-bg', 'rgba(16, 185, 129, 0.1)');
            triggerConfettiBlast(25);
        } else if (selectedRating === 5) {
            responseMsg = "Legendary! You absolute champion! 🤩";
            synthChimeFreq = 680;
            updateMascotText("Five stars! You are an absolute legend! Core systems operating at 100%! 🚀🔥");
            $('svg').css('--eye-socket-bg', 'rgba(139, 92, 246, 0.2)');
            triggerConfettiBlast(80);
        }

        playBubbleSFX(synthChimeFreq, 0.15);
        $('#feedback-result').text(responseMsg).css({
            color: selectedRating >= 4 ? 'var(--accent-color)' : 'var(--primary-color)',
            transform: 'scale(1.05)'
        });
        
        setTimeout(() => {
            $('#feedback-result').css('transform', 'scale(1)');
        }, 200);
    });


    /* ==========================================================================
       9. SOCIAL SHARER SIMULATIONS
       ========================================================================== */
    function registerShareAction(btnId, platform) {
        $(btnId).on('click', function () {
            playBubbleSFX(550, 0.1);
            triggerConfettiBlast(20);
            
            let message = "";
            let shareUrl = window.location.href;

            if ($('body').hasClass('mode-app')) {
                message = "🚀 Just downloaded the stunning new Aether Hub App! High-fidelity rendering, 3D interactive graphics, and clean setups! Checkout my thank you dashboard.";
            } else {
                message = "📚 Claimed my free copy of 'Cybernetic Horizons: A Designer's Guide to 2026'. Premium typography, illustrations, and amazing rewards! Grab your download.";
            }

            // Simulated dynamic social alerts
            const mockWindowText = `
--- ${platform.toUpperCase()} SHARING MODAL ---
Status updates prepared:
"${message}"
Target URL: ${shareUrl}

[✔] Simulated posting successful! Thank you for sharing.
            `;
            alert(mockWindowText);
            updateMascotText(`Awesome! Shared on ${platform}! You are a true social superstar. 🌟`);
        });
    }

    registerShareAction('#btn-share-twitter', 'Twitter');
    registerShareAction('#btn-share-linkedin', 'LinkedIn');
    registerShareAction('#btn-share-facebook', 'Facebook');
});
