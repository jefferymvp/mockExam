// Mock Question Bank

const banks = {
    'bank1': {
        name: '基础知识',
        single: [
            {
                id: 101,
                type: 'single',
                title: 'UniApp 是基于哪个框架的？',
                options: [
                    { label: 'A', value: 'React' },
                    { label: 'B', value: 'Vue' },
                    { label: 'C', value: 'Angular' },
                    { label: 'D', value: 'Flutter' }
                ],
                answer: 'B'
            },
            {
                id: 102,
                type: 'single',
                title: '下列哪个标签用于页面跳转？',
                options: [
                    { label: 'A', value: 'navigator' },
                    { label: 'B', value: 'view' },
                    { label: 'C', value: 'image' },
                    { label: 'D', value: 'text' }
                ],
                answer: 'A'
            },
            {
                id: 103,
                type: 'single',
                title: 'CSS中，flex布局的主轴方向是由哪个属性控制的？',
                options: [
                    { label: 'A', value: 'justify-content' },
                    { label: 'B', value: 'align-items' },
                    { label: 'C', value: 'flex-direction' },
                    { label: 'D', value: 'flex-wrap' }
                ],
                answer: 'C'
            },
            {
                id: 104,
                type: 'single',
                title: 'Vue实例的生命周期钩子中，最早执行的是？',
                options: [
                    { label: 'A', value: 'created' },
                    { label: 'B', value: 'mounted' },
                    { label: 'C', value: 'beforeCreate' },
                    { label: 'D', value: 'updated' }
                ],
                answer: 'C'
            },
            {
                id: 105,
                type: 'single',
                title: 'HTTP协议中，表示请求成功的状态码是？',
                options: [
                    { label: 'A', value: '200' },
                    { label: 'B', value: '404' },
                    { label: 'C', value: '500' },
                    { label: 'D', value: '302' }
                ],
                answer: 'A'
            }
        ],
        multi: [
            {
                id: 201,
                type: 'multi',
                title: '以下属于前端三大框架的是？',
                options: [
                    { label: 'A', value: 'React' },
                    { label: 'B', value: 'Vue' },
                    { label: 'C', value: 'Angular' },
                    { label: 'D', value: 'jQuery' }
                ],
                answer: ['A', 'B', 'C']
            },
            {
                id: 202,
                type: 'multi',
                title: 'UniApp支持发布到哪些平台？',
                options: [
                    { label: 'A', value: '微信小程序' },
                    { label: 'B', value: 'H5' },
                    { label: 'C', value: 'Android App' },
                    { label: 'D', value: 'iOS App' }
                ],
                answer: ['A', 'B', 'C', 'D']
            },
            {
                id: 203,
                type: 'multi',
                title: '下列哪些是HTML5新增的标签？',
                options: [
                    { label: 'A', value: 'header' },
                    { label: 'B', value: 'footer' },
                    { label: 'C', value: 'div' },
                    { label: 'D', value: 'section' }
                ],
                answer: ['A', 'B', 'D']
            },
            {
                id: 204,
                type: 'multi',
                title: 'JavaScript中的基本数据类型包括？',
                options: [
                    { label: 'A', value: 'String' },
                    { label: 'B', value: 'Number' },
                    { label: 'C', value: 'Boolean' },
                    { label: 'D', value: 'Object' }
                ],
                answer: ['A', 'B', 'C']
            },
            {
                id: 205,
                type: 'multi',
                title: 'Vue中组件通信的方式有哪些？',
                options: [
                    { label: 'A', value: 'props' },
                    { label: 'B', value: '$emit' },
                    { label: 'C', value: 'Vuex' },
                    { label: 'D', value: 'provide/inject' }
                ],
                answer: ['A', 'B', 'C', 'D']
            }
        ],
        judge: [
            {
                id: 301,
                type: 'judge',
                title: 'UniApp只能开发小程序。',
                options: [
                    { label: '正确', value: '1' },
                    { label: '错误', value: '0' }
                ],
                answer: '0'
            },
            {
                id: 302,
                type: 'judge',
                title: 'Vue中的v-if和v-show的作用完全一样。',
                options: [
                    { label: '正确', value: '1' },
                    { label: '错误', value: '0' }
                ],
                answer: '0'
            },
            {
                id: 303,
                type: 'judge',
                title: 'localStorage存储的数据没有过期时间。',
                options: [
                    { label: '正确', value: '1' },
                    { label: '错误', value: '0' }
                ],
                answer: '1'
            },
            {
                id: 304,
                type: 'judge',
                title: 'JavaScript是强类型语言。',
                options: [
                    { label: '正确', value: '1' },
                    { label: '错误', value: '0' }
                ],
                answer: '0'
            },
            {
                id: 305,
                type: 'judge',
                title: '在UniApp中，可以使用npm安装第三方库。',
                options: [
                    { label: '正确', value: '1' },
                    { label: '错误', value: '0' }
                ],
                answer: '1'
            }
        ]
    },
    'bank2': {
        name: '进阶挑战',
        single: [
            {
                id: 401,
                type: 'single',
                title: 'Vue 3 中，使用哪个函数定义响应式对象？',
                options: [
                    { label: 'A', value: 'reactive' },
                    { label: 'B', value: 'ref' },
                    { label: 'C', value: 'computed' },
                    { label: 'D', value: 'watch' }
                ],
                answer: 'A'
            },
             {
                id: 402,
                type: 'single',
                title: '在 JavaScript Event Loop 中，Microtask 的优先级比 Macrotask？',
                options: [
                    { label: 'A', value: '高' },
                    { label: 'B', value: '低' },
                    { label: 'C', value: '一样' },
                    { label: 'D', value: '随机' }
                ],
                answer: 'A'
            }
        ],
        multi: [
             {
                id: 501,
                type: 'multi',
                title: '以下哪些是 ES6 新特性？',
                options: [
                    { label: 'A', value: 'Arrow Function' },
                    { label: 'B', value: 'Promise' },
                    { label: 'C', value: 'Classes' },
                    { label: 'D', value: 'var' }
                ],
                answer: ['A', 'B', 'C']
            }
        ],
        judge: [
             {
                id: 601,
                type: 'judge',
                title: 'Vue 3 完全兼容 Vue 2 的所有特性。',
                options: [
                    { label: '正确', value: '1' },
                    { label: '错误', value: '0' }
                ],
                answer: '0'
            }
        ]
    }
};

export default {
    getBanks: function() {
        return Object.keys(banks).map(key => ({
            key: key,
            name: banks[key].name
        }));
    },
    getQuestions: function(bankKey, type, count) {
        const bank = banks[bankKey] || banks['bank1'];
        let pool = [];

        if (type === 'single') pool = bank.single;
        else if (type === 'multi') pool = bank.multi;
        else if (type === 'judge') pool = bank.judge;
        else pool = [...bank.single, ...bank.multi, ...bank.judge];

        // Shuffle
        let shuffled = [...pool].sort(() => 0.5 - Math.random());

        // Slice
        return shuffled.slice(0, count);
    },
    getTotalCount: function(bankKey, type) {
        const bank = banks[bankKey] || banks['bank1'];

        if (type === 'single') return bank.single.length;
        if (type === 'multi') return bank.multi.length;
        if (type === 'judge') return bank.judge.length;
        return bank.single.length + bank.multi.length + bank.judge.length;
    }
}
