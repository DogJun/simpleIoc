import createIoc from './ioc'
import 'reflect-metadata'
import { getParameterName } from './utils'
import camelCase from 'camelcase'
// 管理需要注入的类的容齐
const container = createIoc()


/**
 * 当前controller需要
 * 1. 常量标识类名
 * 2. 具体的service类
 */
const TYPES = {
  IndexService: Symbol.for('IndexService')
}
class IndexService {
  log (str: string) {
    console.log(str)
  }
}
container.bind(TYPES.IndexService, () => new IndexService())
/**
 * 1. 分析当前类所需要注入的类的别名
 * @param serviceIdentifier 需要注入的类的别名
 */
function inject (serviceIdentifier) {
  return function (target, targetKey, index) {
    console.log(target, targetKey, index)
    if (index === 0) {
      // 通过元数据的方式挂在类上
      Reflect.defineMetadata(serviceIdentifier, container.use(serviceIdentifier), target)
    }
  }
}
function controller<T extends { new (...args: any[]): {} }> (constructor: T) {
  const injectParams = getParameterName(constructor)
  class Controller extends constructor {
    constructor (...args: any[]) {
      super(args)
      const me = this
      for (let identity of injectParams) {
        const _identity = camelCase(identity, {pascalCase: true})
        console.log(_identity)
        me[identity] = Reflect.getMetadata(TYPES[_identity], constructor)
      }
    }
  }
  return Controller
}
@controller
class Controller {
  public indexService
  constructor (@inject(TYPES.IndexService) indexService) {
    this.indexService = indexService
  }
  info () {
    this.indexService.log('hello world')
  }
}
const indexController = new Controller('')
indexController.info()