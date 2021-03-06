import * as React from 'react';
import { shallow } from 'enzyme';
import { GraphEmpty } from '@console/internal/components/graphs/graph-empty';
import { DEFAULT_PROMETHEUS_TIMESPAN } from '@console/internal/components/graphs';
import { parsePrometheusDuration } from '@console/internal/components/utils/datetime';
import { LoadingInline } from '@console/internal/components/utils';
import * as hookUtils from '../../hooks';
import { LineChart } from '../charts/lineChart';
import { DEFAULT_REFRESH_INTERVAL } from '../../const';
import { PipelineExampleNames, pipelineTestData } from '../../../../test-data/pipeline-data';
import PipelineRunDurationGraph from '../PipelineRunDurationGraph';

jest.mock('@console/internal/components/utils/k8s-get-hook', () => ({
  useK8sGet: jest.fn(),
}));

jest.mock('react-i18next', () => {
  const reactI18next = require.requireActual('react-i18next');
  return {
    ...reactI18next,
    useTranslation: () => ({ t: (key) => key }),
  };
});

const usePipelineRunDurationPollSpy = jest.spyOn(hookUtils, 'usePipelineRunDurationPoll');

const mockData = pipelineTestData[PipelineExampleNames.WORKSPACE_PIPELINE];
const { pipeline } = mockData;

type PipelineRunDurationGraphProps = React.ComponentProps<typeof PipelineRunDurationGraph>;

describe('Pipeline Run Duration Graph', () => {
  let PipelineRunDurationGraphProps: PipelineRunDurationGraphProps;
  beforeEach(() => {
    PipelineRunDurationGraphProps = {
      pipeline,
      timespan: DEFAULT_PROMETHEUS_TIMESPAN,
      interval: parsePrometheusDuration(DEFAULT_REFRESH_INTERVAL),
    };
  });

  it('Should render an LoadingInline if query result is loading', () => {
    usePipelineRunDurationPollSpy.mockReturnValue([
      { data: { result: [{ x: 'x' }] } },
      false,
      true,
    ]);
    const PipelineRunDurationGraphWrapper = shallow(
      <PipelineRunDurationGraph {...PipelineRunDurationGraphProps} />,
    );
    expect(PipelineRunDurationGraphWrapper.find(LoadingInline).exists()).toBe(true);
  });

  it('Should render an empty state if query result is empty', () => {
    usePipelineRunDurationPollSpy.mockReturnValue([{ data: { result: [] } }, false, false]);
    const PipelineRunDurationGraphWrapper = shallow(
      <PipelineRunDurationGraph {...PipelineRunDurationGraphProps} />,
    );
    expect(PipelineRunDurationGraphWrapper.find(GraphEmpty).exists()).toBe(true);
  });

  it('Should render an empty state if query resulted in error', () => {
    usePipelineRunDurationPollSpy.mockReturnValue([{ data: { result: [] } }, true, false]);
    const PipelineRunDurationGraphWrapper = shallow(
      <PipelineRunDurationGraph {...PipelineRunDurationGraphProps} />,
    );
    expect(PipelineRunDurationGraphWrapper.find(GraphEmpty).exists()).toBe(true);
  });

  it('Should render a LineChart if data is available', () => {
    usePipelineRunDurationPollSpy.mockReturnValue([
      { data: { result: [{ x: Date.now(), y: 1 }] } },
      false,
      false,
    ]);
    const PipelineRunDurationGraphWrapper = shallow(
      <PipelineRunDurationGraph {...PipelineRunDurationGraphProps} />,
    );
    expect(PipelineRunDurationGraphWrapper.find(LineChart).exists()).toBe(true);
  });
});
