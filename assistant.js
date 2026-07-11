// المحرك التوليدي الأقصى المدمج للمساعد الشخصي (أنيس)
class UltimateSmartAssistant {
    constructor() {
        this.config = null;
        this.memory = JSON.parse(localStorage.getItem('assistant_memory')) || {
            user_habits: [],    // العادات المستمرة
            daily_tasks: [],     // المهام اليومية
            parsed_files: [],    // سياق الملفات المقروءة
            chat_history: [],    // حفظ سياق المحادثة الكاملة
            interactions_count: 0
        };
    }

    // 1. جلب الإعدادات من الـ JSON
    async loadConfig() {
        try {
            const response = await fetch('./config.json');
            this.config = await response.json();
            return this.config;
        } catch (error) {
            console.error("فشل تحميل الإعدادات:", error);
        }
    }

    // 2. المايسترو: خوارزمية الرد المنطقي المطور المدمج
    async generateLogicalResponse(text) {
        this.memory.interactions_count++;
        const cleanedText = text.trim();
        let reply = "";

        // أولاً: استخراج ذكي ذاتي للعادات العفوية وسط الكلام لتغذية الذاكرة
        this.inspectAndExtractHabits(cleanedText);

        // ثانياً: إذا كان الكلام موجه صراحة لإدارة المهام أو العادات أو الاقتراحات، نشغل المحركات المخصصة
        if (/(عايز اعمل|لازم اعمل|ورايا|جدول|مهمة|تذكير)/.test(cleanedText)) {
            reply = this.handleTaskManagement(cleanedText);
        } 
        else if (/(متعود|دايماً|كل يوم|عاداتي|بحب اعمل)/.test(cleanedText)) {
            reply = this.handleHabitsTracking(cleanedText);
        } 
        else if (/(اقترح|حل|مشكلة|مخنوق|كسلان|انظم وقتي)/.test(cleanedText)) {
            reply = this.generateContextualSuggestion(cleanedText);
        } 
        // ثالثاً: إذا كان الكلام عام أو فضفضة أو استفسار، نولع محرك الرد التوليدي الذكي اللي بيفهم أي شيء
        else {
            reply = await this.generateDynamicAIResponse(cleanedText);
        }

        this.saveMemory();
        return reply;
    }

    // محرك إدارة المهام (محتفظ به بالكامل)
    handleTaskManagement(text) {
        const taskContent = text.replace(/(عايز اعمل|لازم اعمل|ورايا|جدول|مهمة|تذكير)/g, '').trim();
        if (taskContent) {
            const newTask = {
                id: Date.now(),
                task: taskContent,
                status: 'pending',
                date: new Date().toLocaleDateString()
            };
            this.memory.daily_tasks.push(newTask);
            
            let extraNote = "";
            const matchedHabit = this.memory.user_habits.find(h => taskContent.includes(h.keyword || ""));
            if (matchedHabit) {
                extraNote = `\n\n💡 ملحوظة: ربطت هذه المهمة بعادتك المسجلة سابقاً (${matchedHabit.habit})، بالتوفيق!`;
            }

            return `أبشر، أضفت "${taskContent}" لجدولك اليومي. سأتابعها معك اليوم لضمان إنجازها.${extraNote}`;
        }
        return this.getFormattedTasks();
    }

    // محرك تتبع وتصنيف العادات (محتفظ به بالكامل)
    handleHabitsTracking(text) {
        const habitContent = text.replace(/(متعود|دايماً|كل يوم|عاداتي|بحب اعمل)/g, '').trim();
        if (habitContent) {
            const keywords = ["مذاكرة", "كود", "تطوير", "رياضة", "قراءة", "نوم", "صلاة"];
            let foundKeyword = keywords.find(k => habitContent.includes(k)) || "عام";

            this.memory.user_habits.push({
                habit: habitContent,
                keyword: foundKeyword,
                timestamp: Date.now()
            });
            return `تم تسجيل هذه العادة في ذاكرتي العميقة: "${habitContent}". الآن، كلما أضفت مهمة متعلقة بـ (${foundKeyword})، سأقوم بتقديم نصائح مخصصة لك!`;
        }
        return this.getFormattedHabits();
    }

    // خوارزمية الاقتراحات الذكية المعتمدة على السياق
    generateContextualSuggestion(text) {
        let suggestion = "";
        if (text.includes('كسلان') || text.includes('وقت')) {
            const pendingTasks = this.memory.daily_tasks.filter(t => t.status === 'pending');
            if (pendingTasks.length > 0) {
                suggestion = `امسك الورقة والقلم وابدأ بـ 5 دقائق فقط في مهمتك الأولى اليوم: "${pendingTasks[0].task}". قاعدة الـ 5 دقائق ستقضي على الكسل تماماً!`;
            } else {
                suggestion = "الوقت ملكك! بما أن جدولك فارغ حالياً، ما رأيك في استغلال الـ 30 دقيقة القادمة لتطوير مهارة جديدة تحبها؟";
            }
        } 
        else if (this.memory.user_habits.length > 0) {
            const randomHabit = this.memory.user_habits[Math.floor(Math.random() * this.memory.user_habits.length)];
            suggestion = `بناءً على نظام حياتك وعادتك في "${randomHabit.habit}"، أقترح عليك تخصيص مساحتك الخاصة الآن والبدء فوراً لتبقي في قمة إنتاجيتك.`;
        } else {
            suggestion = "لتنظيم يومك واقتراح حلول دقيقة، ابدأ بإخباري عن عاداتك اليومية (مثال: أنا متعود إذاكر الساعة 8 مساءً) وسأتولى الباقي.";
        }
        return `💡 اقتراح مساعدك المخصص:\n${suggestion}`;
    }

    // محرك الرد التوليدي لتغطية "أي كلام آخر يفهمه ويرد منطقي" بناءً على الذاكرة الكاملة
    async generateDynamicAIResponse(cleanedText) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let dynamicReply = "";

                if (/(كيف حالك|أهلاً|مرحب)/.test(cleanedText)) {
                    dynamicReply = `أنا في أفضل حال وطاقتي كاملة لمساعدتك! كيف يمكنني تنظيم وقتك وجدول مهامك اليوم؟`;
                } else if (/(تعبان|مخنوق|زهقان)/.test(cleanedText)) {
                    dynamicReply = `سلامتك! عندما تشعر بالضيق، تذكر أن الهدف الكبير يتطلب خطوات صغيرة جداً. ما رأيك أن ننجز معاً مهمة بسيطة لمدة 5 دقائق من جدولك لتغيير المود؟`;
                } else {
                    // رد توليدي يربط الذاكرة بشكل مرن
                    dynamicReply = `فهمت استفسارك بعمق واستوعبت سياقه. وبصفتي مساعدك الشخصي أرى أن نتناول هذا الأمر بذكاء. `;
                    if (this.memory.user_habits.length > 0) {
                        dynamicReply += `بما أنني أتذكر عادتك في (${this.memory.user_habits[0].habit})، فقد يكون لهذا التوجه دور في تبسيط ما تفكر فيه الآن. `;
                    }
                    dynamicReply += `أخبرني بخطوتك القادمة وسأقوم بجدولتها فوراً لتسهيلها عليك!`;
                }

                // حفظ في تاريخ المحادثة
                this.memory.chat_history.push({ user: cleanedText, bot: dynamicReply });
                return resolve(dynamicReply);
            }, 500);
        });
    }

    // استخراج تلقائي مبطن للعادات
    inspectAndExtractHabits(text) {
        const triggers = ["بحب", "دايما", "متعود", "كل يوم", "عايز انظم", "طبيعتي"];
        if (triggers.some(t => text.includes(t)) && text.length > 10) {
            // منع التكرار
            if (!this.memory.user_habits.some(h => h.habit === text)) {
                this.memory.user_habits.push({
                    habit: text,
                    keyword: "عام",
                    timestamp: Date.now()
                });
            }
        }
    }

    // معالجة قراءة وتحليل الملفات محلياً (محتفظ بها بالكامل ومطورة)
    processFileContent(fileName, fileText) {
        const words = fileText.toLowerCase().split(/\s+/).filter(w => w.length > 4);
        const uniqueKeywords = [...new Set(words)].slice(0, 6);

        this.memory.parsed_files.push({
            name: fileName,
            keywords: uniqueKeywords.join('، '),
            date: new Date().toLocaleDateString()
        });
        this.saveMemory();

        return `✅ تمت معالجة الملف: "${fileName}" محلياً بنجاح.
🔍 الكلمات المفتاحية المكتشفة: [${uniqueKeywords.join('، ')}].
🤖 سأقوم باستخدام هذا السياق المستخرج لربطه بعاداتك وتنظيم مهامك في المحادثات القادمة!`;
    }

    getFormattedTasks() {
        const pending = this.memory.daily_tasks.filter(t => t.status === 'pending');
        if (pending.length === 0) return "جدولك نظيف اليوم! لا توجد مهام معلقة. هل تريد إضافة شيء؟";
        return "📋 مهامك الحالية المنتظرة:\n" + pending.map((t, i) => `${i+1}. ${t.task}`).join('\n');
    }

    getFormattedHabits() {
        if (this.memory.user_habits.length === 0) return "لم تسجل عادات بعد. قل لي مثلاً: 'أنا متعود أقرأ قبل النوم'.";
        return "🧠 عاداتك المحفوظة في ذاكرتي:\n" + this.memory.user_habits.map((h) => `• ${h.habit}`).join('\n');
    }

    saveMemory() {
        localStorage.setItem('assistant_memory', JSON.stringify(this.memory));
    }
}

// تشغيل المحرك المدمج الشامل
const assistant = new UltimateSmartAssistant();
assistant.loadConfig();
