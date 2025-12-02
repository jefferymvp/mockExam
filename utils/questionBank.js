// Mock Question Bank

const singleChoice = [
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
];

const multiChoice = [
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
        answer: ['A', 'B', 'C'] // Object is reference type, traditionally basic types are string, number, boolean, null, undefined, symbol
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
];

const judgeQuestions = [
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
];

export default {
    getQuestions: function(type, count) {
        let pool = [];
        if (type === 'single') pool = singleChoice;
        else if (type === 'multi') pool = multiChoice;
        else if (type === 'judge') pool = judgeQuestions;
        else pool = [...singleChoice, ...multiChoice, ...judgeQuestions]; // Fallback or mixed

        // Shuffle
        let shuffled = pool.sort(() => 0.5 - Math.random());

        // Slice
        return shuffled.slice(0, count);
    },
    getTotalCount: function(type) {
        if (type === 'single') return singleChoice.length;
        if (type === 'multi') return multiChoice.length;
        if (type === 'judge') return judgeQuestions.length;
        return singleChoice.length + multiChoice.length + judgeQuestions.length;
    }
}
